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

  // Un WAV de varios minutos tarda más que el corte general de 20 s de la API (subida + B2 +
  // MP3 de preview). Con ese corte el admin daba error aunque el archivo era válido.
  it("does not use the API's 20 s cut: big WAVs take minutes", async () => {
    const { apiMock, adminService } = await loadAdminService();
    await adminService.upload.file(new File(["a"], "a.wav"));
    const [, , config] = apiMock.post.mock.calls[0];
    expect(config.timeout).toBeGreaterThanOrEqual(10 * 60 * 1000);
  });
});

describe("adminService.upload.files (varios archivos)", () => {
  it("uploads one file per request, in order, so the server never holds several big WAVs at once", async () => {
    const { apiMock, adminService } = await loadAdminService();
    const order = [];
    apiMock.post.mockImplementation(async (url, body) => {
      order.push(body.get("file").name);
      return { data: { url: `https://b2/${body.get("file").name}`, filename: body.get("file").name } };
    });
    const onFile = vi.fn();
    const { results } = await adminService.upload.files(
      [new File(["a"], "a.wav"), new File(["b"], "b.wav")],
      "loops",
      { onFile }
    );
    expect(order).toEqual(["a.wav", "b.wav"]);
    apiMock.post.mock.calls.forEach(([url, body, config]) => {
      expect(url).toBe("/api/admin/upload");
      expect(body.get("folder")).toBe("loops");
      expect(config.timeout).toBeGreaterThanOrEqual(10 * 60 * 1000);
    });
    expect(results).toEqual([
      { success: true, originalName: "a.wav", url: "https://b2/a.wav", filename: "a.wav" },
      { success: true, originalName: "b.wav", url: "https://b2/b.wav", filename: "b.wav" },
    ]);
    expect(onFile).toHaveBeenCalledWith(2, 2);
  });

  it("one file failing does not stop the rest", async () => {
    const { apiMock, adminService } = await loadAdminService();
    apiMock.post
      .mockRejectedValueOnce({ response: { data: { message: "Archivo demasiado grande (máx 100MB)" } } })
      .mockResolvedValueOnce({ data: { url: "https://b2/b.wav" } });
    const { results } = await adminService.upload.files([new File(["a"], "a.wav"), new File(["b"], "b.wav")], "beats");
    expect(results[0]).toEqual({ success: false, originalName: "a.wav", error: "Archivo demasiado grande (máx 100MB)" });
    expect(results[1]).toMatchObject({ success: true, originalName: "b.wav", url: "https://b2/b.wav" });
  });
});
