
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Product {
  description: string;
  quantity: number;
  origin: string;
  unit: string;
  unit_price: number;
  sub_total: number;
}

export default function ProductForm({ shipmentId, onSave }: { shipmentId: number; onSave: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const addProduct = () => {
    setProducts([
      ...products,
      {
        description: "",
        quantity: 1,
        origin: "VN",
        unit: "PCS",
        unit_price: 0,
        sub_total: 0,
      },
    ]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
      sub_total:
        field === "quantity" || field === "unit_price"
          ? (field === "quantity" ? value : updatedProducts[index].quantity) *
            (field === "unit_price" ? value : updatedProducts[index].unit_price)
          : updatedProducts[index].sub_total,
    };
    setProducts(updatedProducts);
  };

  const handleSave = async () => {
    try {
      await api.post(`/shipments/${shipmentId}/create_products`, {
        products: products.map(({ description, quantity, origin, unit, unit_price }) => ({
          description,
          quantity,
          origin,
          unit,
          unit_price,
        })),
      });
      toast({
        title: "Thành công",
        description: "Đã lưu thông tin sản phẩm",
      });
      onSave();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu thông tin sản phẩm",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Danh sách sản phẩm</h3>
        <Button onClick={addProduct} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mô tả</TableHead>
            <TableHead>Số lượng</TableHead>
            <TableHead>Xuất xứ</TableHead>
            <TableHead>Đơn vị</TableHead>
            <TableHead>Đơn giá</TableHead>
            <TableHead>Thành tiền</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  value={product.description}
                  onChange={(e) => updateProduct(index, "description", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) => updateProduct(index, "quantity", parseInt(e.target.value))}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={product.origin}
                  onChange={(e) => updateProduct(index, "origin", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={product.unit}
                  onChange={(e) => updateProduct(index, "unit", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  value={product.unit_price}
                  onChange={(e) => updateProduct(index, "unit_price", parseFloat(e.target.value))}
                />
              </TableCell>
              <TableCell>{product.sub_total.toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProduct(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center pt-4">
        <div className="text-lg font-medium">
          Tổng cộng: {products.reduce((sum, p) => sum + p.sub_total, 0).toLocaleString()} VND
        </div>
        <Button onClick={handleSave} className="px-6">
          Lưu thông tin
        </Button>
      </div>
    </div>
  );
}
