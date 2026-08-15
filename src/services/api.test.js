import axios from "axios";

jest.mock("axios", () => ({ create: jest.fn() }));

const makeApiMock = () => {
  const apiMock = jest.fn();
  apiMock.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };
  apiMock.get = jest.fn();
  apiMock.post = jest.fn();
  apiMock.put = jest.fn();
  apiMock.delete = jest.fn();
  return apiMock;
};

const loadApiModule = () => {
  let apiMock;
  let apiExports;
  jest.isolateModules(() => {
    apiMock = makeApiMock();
    axios.create.mockReturnValue(apiMock);
    apiExports = require("./api");
  });
  const responseErrorHandler = apiMock.interceptors.response.use.mock.calls[0][1];
  return { apiMock, responseErrorHandler, ...apiExports };
};

const makeError = (overrides = {}) => ({
  config: { url: "/api/resources/beats", headers: {}, ...overrides.config },
  response: { status: 401, ...overrides.response },
});

describe("api.js response interceptor (401 refresh flow, cookie-based auth)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("never registers a request interceptor (no manual Authorization header)", () => {
    const { apiMock } = loadApiModule();
    expect(apiMock.interceptors.request.use).not.toHaveBeenCalled();
  });

  it("triggers exactly one /api/auth/refresh call for a single 401, then retries the original request without touching localStorage or Authorization headers", async () => {
    const { apiMock, responseErrorHandler } = loadApiModule();
    apiMock.post.mockResolvedValue({});
    apiMock.mockResolvedValue({ data: {} });
    jest.spyOn(window.localStorage.__proto__, "setItem");

    const error = makeError();
    await responseErrorHandler(error);

    expect(apiMock.post).toHaveBeenCalledTimes(1);
    expect(apiMock.post).toHaveBeenCalledWith("/api/auth/refresh");
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(error.config.headers.Authorization).toBeUndefined();
    expect(window.localStorage.setItem).not.toHaveBeenCalled();

    window.localStorage.setItem.mockRestore();
  });

  it("queues concurrent 401s behind a single refresh call and retries all of them", async () => {
    const { apiMock, responseErrorHandler } = loadApiModule();
    let resolveRefresh;
    apiMock.post.mockImplementation(
      () => new Promise((resolve) => { resolveRefresh = resolve; })
    );
    apiMock.mockResolvedValue({ data: {} });

    const error1 = makeError();
    const error2 = makeError();

    const p1 = responseErrorHandler(error1);
    const p2 = responseErrorHandler(error2);

    expect(apiMock.post).toHaveBeenCalledTimes(1);

    resolveRefresh({});
    await Promise.all([p1, p2]);

    expect(apiMock.post).toHaveBeenCalledTimes(1);
    expect(apiMock).toHaveBeenCalledTimes(2);
  });

  it("calls the registered unauthorized handler when the refresh call itself fails", async () => {
    const { apiMock, responseErrorHandler, setUnauthorizedHandler } = loadApiModule();
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    apiMock.post.mockRejectedValue(new Error("refresh failed"));

    await expect(responseErrorHandler(makeError())).rejects.toThrow("refresh failed");

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not attempt a refresh for a 401 coming from the refresh endpoint itself", async () => {
    const { apiMock, responseErrorHandler } = loadApiModule();
    const error = makeError({ config: { url: "/api/auth/refresh", headers: {} } });

    await expect(responseErrorHandler(error)).rejects.toBe(error);
    expect(apiMock.post).not.toHaveBeenCalled();
  });

  it("passes through non-401 errors unchanged", async () => {
    const { apiMock, responseErrorHandler } = loadApiModule();
    const error = makeError({ response: { status: 500 } });

    await expect(responseErrorHandler(error)).rejects.toBe(error);
    expect(apiMock.post).not.toHaveBeenCalled();
  });
});
