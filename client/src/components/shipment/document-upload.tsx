import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface DocumentUploadProps {
  shipmentId: string | number;
}

interface Credential {
  id: number;
  shipment_id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export function DocumentUpload({ shipmentId }: DocumentUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Xử lý tải xuống file
  const handleDownload = (url: string, documentName: string) => {
    // Kiểm tra URL
    if (!url) {
      alert("Không có URL tải xuống cho tài liệu này");
      return;
    }

    // Tạo một thẻ a ẩn để tải xuống
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = documentName || "document"; // Tên file khi tải xuống
    anchor.target = "_blank"; // Mở trong tab mới nếu không thể tải trực tiếp
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const fetchCredentials = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/credentials?shipment_id=${shipmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Không thể tải danh sách chứng từ");
      }

      const data = await response.json();
      const credentialsList = data.credentials || [];
      setCredentials(credentialsList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Đã xảy ra lỗi khi tải chứng từ"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [shipmentId]);

  // Hàm lấy icon dựa trên loại chứng từ
  const getFileIcon = (key: string) => {
    switch (key) {
      case "house_bill":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
          </svg>
        );
      case "air_way_bill":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        );
      case "invoice":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <circle cx="12" cy="14" r="2" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M16 17.8V20H8v-2.2" />
          </svg>
        );
      case "fda":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        );
      case "msds":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
            <path d="M12 6.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
            <path d="M12 18.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
            <path d="M19.5 12a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
          </svg>
        );
      case "fumigation":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M9 13h.01" />
            <path d="M15 13h.01" />
            <path d="M9 17h.01" />
            <path d="M15 17h.01" />
            <path d="M5 3v4" />
            <path d="M19 3v4" />
            <path d="M21 8H3" />
            <path d="M3 21h18V8H3z" />
          </svg>
        );
      case "other":
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
    }
  };

  // Lấy tên tương ứng với loại chứng từ
  const getDocumentName = (key: string) => {
    switch (key) {
      case "house_bill":
        return "House Bill";
      case "air_way_bill":
        return "AirWay Bill";
      case "invoice":
        return "Hóa Đơn";
      case "fda":
        return "Giấy Phép FDA";
      case "msds":
        return "Phiếu An Toàn Hóa Chất (MSDS)";
      case "fumigation":
        return "Giấy Chứng Nhận Xông Hơi";
      case "other":
        return "Tài Liệu Khác";
      default:
        return "Tài Liệu";
    }
  };

  const handleUpload = async (documentType: string) => {
    try {
      // Hiển thị trạng thái đang upload cho loại chứng từ này
      setIsUploading((prev) => ({ ...prev, [documentType]: true }));
      setUploadError(null);

      // Mở cửa sổ chọn file
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          setIsUploading((prev) => ({ ...prev, [documentType]: false }));
          return;
        }

        // Tạo FormData để gửi file
        const formData = new FormData();
        formData.append("type", documentType);
        formData.append("file", file);

        // Lấy token từ localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          setUploadError(
            "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
          );
          setIsUploading((prev) => ({ ...prev, [documentType]: false }));
          return;
        }

        // Gọi API upload file
        const url = `${API_BASE_URL}/credentials/upload?shipment_id=${shipmentId}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        // Xử lý kết quả
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Không thể tải lên chứng từ");
        }

        // Tải lại danh sách chứng từ sau khi upload thành công
        fetchCredentials();

        // Hiển thị thông báo thành công
        alert(`Đã tải lên ${getDocumentName(documentType)} thành công!`);
      };

      // Kích hoạt chọn file
      input.click();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Đã có lỗi xảy ra khi tải lên chứng từ",
      );
    } finally {
      setIsUploading((prev) => ({ ...prev, [documentType]: false }));
    }
  };

  // Kiểm tra xem có các chứng từ bắt buộc hay không
  const hasHouseBill = credentials.some((c) => c.key === "house_bill");
  const hasAirWayBill = credentials.some((c) => c.key === "air_way_bill");
  const hasInvoice = credentials.some((c) => c.key === "invoice");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          Không thể tải danh sách chứng từ
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau hoặc liên hệ bộ
          phận hỗ trợ.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Tải lại
        </Button>
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Chưa có chứng từ nào</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Đơn hàng này hiện chưa có chứng từ nào. Các chứng từ sẽ được tự động
          cập nhật khi có sẵn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hiển thị các chứng từ đã có */}
      <div className="space-y-4">
        {credentials.map((credential) => (
          <div
            key={credential.id}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="bg-primary/10 p-2.5 rounded-lg mr-3">
                {getFileIcon(credential.key)}
              </div>
              <div>
                <h3 className="font-medium">
                  {getDocumentName(credential.key)}
                </h3>
                <p className="text-sm text-gray-500">
                  PDF,{" "}
                  {credential.updated_at
                    ? new Date(credential.updated_at).toLocaleDateString(
                        "vi-VN",
                      )
                    : ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleDownload(
                  credential.value,
                  getDocumentName(credential.key),
                )
              }
            >
              Tải xuống
            </Button>
          </div>
        ))}
      </div>

      {/* Hiển thị các nút tải lên cho chứng từ bắt buộc còn thiếu */}
      {(!hasHouseBill || !hasAirWayBill || !hasInvoice) && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-3">
            Tải lên chứng từ còn thiếu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {!hasHouseBill && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleUpload("house_bill")}
                disabled={isUploading["house_bill"]}
              >
                {isUploading["house_bill"] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
                Vận Đơn Đường Biển
              </Button>
            )}

            {!hasAirWayBill && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleUpload("air_way_bill")}
                disabled={isUploading["air_way_bill"]}
              >
                {isUploading["air_way_bill"] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
                Vận Đơn Hàng Không
              </Button>
            )}

            {!hasInvoice && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleUpload("invoice")}
                disabled={isUploading["invoice"]}
              >
                {isUploading["invoice"] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
                Hóa Đơn
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Menu chọn loại chứng từ khác để tải lên */}
      <div className="text-center mt-4">
        <div className="relative inline-block">
          <select
            className="appearance-none bg-transparent border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm font-medium"
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                handleUpload(value);
                e.target.value = ""; // Reset select sau khi chọn
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Tải lên chứng từ khác
            </option>
            <option value="fda">Giấy Phép FDA</option>
            <option value="msds">Phiếu An Toàn Hóa Chất (MSDS)</option>
            <option value="fumigation">Giấy Chứng Nhận Xông Hơi</option>
            <option value="other">Tài Liệu Khác</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Hiển thị lỗi upload nếu có */}
      {uploadError && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mt-4 text-sm border border-red-200">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {uploadError}
          </div>
        </div>
      )}
    </div>
  );
}
