import axios from "axios";

vi.mock("axios", () => ({ default: { create: vi.fn() } }));

const loadAdminService = async () => {
  vi.resetModules();
  const apiMock = vi.fn();
  apiMock.interceptors = { request: { use: vi.fn() }, response: { use: vi.fn() } };
  apiMock.post = vi.fn().mockResolvedValue({ data: { url: "https://b2/x" } });
  axios.create.mockReturnValue(apiMock);
  const { adminService } = await import("./api");
  return { apiMock, adminService };
};

describe("adminService.upload.file", () => {
  it("passes onUploadProgress through to axios", async () => {
    const { apiMock, adminService } = await loadAdminService();
    const onUploadProgress = vi.fn();
    await adminService.upload.file(new File(["a"], "a.wav"), "beats", { onUploadProgress });

    const [url, body, config] = apiMock.post.mock.calls[0];
    expect(url).toBe("/api/admin/upload");
    expect(body.get("folder")).toBe("beats");
    expect(config.onUploadProgress).toBe(onUploadProgress);
  });

  it("still works with only a file and a folder", async () => {
    const { apiMock, adminService } = await loadAdminService();
    await adminService.upload.file(new File(["a"], "a.wav"));
    const [, body, config] = apiMock.post.mock.calls[0];
    expect(body.get("folder")).toBe("uploads");
    expect(config.onUploadProgress).toBeUndefined();
    expect(config.headers).toEqual({ "Content-Type": null });
  });
});
