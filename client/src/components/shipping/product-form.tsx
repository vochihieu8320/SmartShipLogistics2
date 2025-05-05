
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { X, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

interface Product {
  description: string;
  quantity: number;
  origin: string;
  unit: string;
  unit_price: number;
  sub_total: number;
}

export default function ProductForm({ form }: { form: UseFormReturn }) {
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const handleAddProduct = () => {
    setProducts([...products, {
      description: '',
      quantity: 1,
      origin: 'VN',
      unit: 'pcs',
      unit_price: 0,
      sub_total: 0
    }]);
  };

  const handleRemoveProduct = (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      [field]: value,
      sub_total: field === 'quantity' || field === 'unit_price'
        ? (field === 'quantity' ? value : newProducts[index].quantity) *
          (field === 'unit_price' ? value : newProducts[index].unit_price)
        : newProducts[index].sub_total
    };
    setProducts(newProducts);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${form.getValues().shipment.id}/create_products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ products })
      });

      if (!response.ok) throw new Error('Failed to save products');

      toast({
        title: "Thành công",
        description: "Đã lưu thông tin sản phẩm",
      });
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
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Mô tả sản phẩm</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Xuất xứ</TableHead>
              <TableHead>Đơn vị</TableHead>
              <TableHead>Đơn giá</TableHead>
              <TableHead>Thành tiền</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={product.description}
                    onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                    placeholder="Nhập mô tả"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                    min={1}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={product.origin}
                    onValueChange={(value) => handleProductChange(index, 'origin', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VN">Việt Nam</SelectItem>
                      <SelectItem value="US">Hoa Kỳ</SelectItem>
                      <SelectItem value="CN">Trung Quốc</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={product.unit}
                    onValueChange={(value) => handleProductChange(index, 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Cái</SelectItem>
                      <SelectItem value="kg">KG</SelectItem>
                      <SelectItem value="box">Thùng</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={product.unit_price}
                    onChange={(e) => handleProductChange(index, 'unit_price', parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                  />
                </TableCell>
                <TableCell>{product.sub_total.toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveProduct(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddProduct}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          className="gap-2"
          disabled={products.length === 0}
        >
          <Save className="h-4 w-4" />
          Lưu thông tin
        </Button>
      </div>
    </div>
  );
}
