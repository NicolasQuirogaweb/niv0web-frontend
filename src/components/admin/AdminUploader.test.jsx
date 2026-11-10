import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../i18n/config";
import { AdminUploader } from "./AdminUploader";
import { adminService } from "../../services/api";

vi.mock("../../services/api", () => ({
  adminService: { upload: { file: vi.fn() } },
}));

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};

const image = () => new File(["img"], "cover.png", { type: "image/png" });
const audio = () => new File(["wav"], "beat.wav", { type: "audio/wav" });

describe("AdminUploader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
  });

  it("is a label for a file input that stays in the tab order (not display:none)", () => {
    render(<AdminUploader accept="audio/*" />);
    const input = screen.getByLabelText(/arrastr/i);
    expect(input).toHaveAttribute("type", "file");
    expect(input.closest("label")).not.toBeNull();
    expect(input.style.display).not.toBe("none");
    expect(input).not.toHaveAttribute("tabindex", "-1");
  });

  it("uploads the picked file and reports the URL", async () => {
    const onUpload = vi.fn();
    adminService.upload.file.mockResolvedValue({ data: { url: "https://b2/beat.wav" } });
    render(<AdminUploader folder="beats" accept="audio/*" onUpload={onUpload} />);
    await userEvent.upload(screen.getByLabelText(/arrastr/i), audio());
    await waitFor(() => expect(onUpload).toHaveBeenCalledWith("https://b2/beat.wav", "beat.wav"));
    expect(adminService.upload.file).toHaveBeenCalledWith(expect.any(File), "beats", expect.objectContaining({ onUploadProgress: expect.any(Function) }));
  });

  it("shows a progress bar with the percentage while uploading", async () => {
    const pending = deferred();
    adminService.upload.file.mockReturnValue(pending.promise);
    render(<AdminUploader accept="audio/*" />);
    await userEvent.upload(screen.getByLabelText(/arrastr/i), audio());

    const { onUploadProgress } = adminService.upload.file.mock.calls[0][2];
    act(() => onUploadProgress({ loaded: 42, total: 100 }));

    const bar = screen.getByRole("progressbar", { name: /progreso de subida/i });
    expect(bar).toHaveAttribute("value", "42");
    expect(screen.getByText("42%")).toBeInTheDocument();

    await act(async () => pending.resolve({ data: { url: "u" } }));
  });

  it("shows the upload progress on top of an image preview", async () => {
    const pending = deferred();
    adminService.upload.file.mockReturnValue(pending.promise);
    render(<AdminUploader accept="image/*" />);
    await userEvent.upload(screen.getByLabelText(/arrastr/i), image());

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    await act(async () => pending.resolve({ data: { url: "u" } }));
  });

  it("shows a failed image upload as an error over the preview", async () => {
    adminService.upload.file.mockRejectedValue({ response: { data: { message: "Too big" } } });
    render(<AdminUploader accept="image/*" />);
    vi.spyOn(console, "error").mockImplementation(() => {});
    await userEvent.upload(screen.getByLabelText(/arrastr/i), image());

    expect(await screen.findByRole("alert")).toHaveTextContent("Too big");
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
