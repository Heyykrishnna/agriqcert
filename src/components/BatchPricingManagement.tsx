import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface BatchPrice {
  id: string;
  batch_id: string;
  price_per_unit: number;
  currency: string;
  msp: number | null;
  market_rate: number | null;
  minimum_order_quantity: number | null;
  negotiable: boolean;
  discount_percentage: number;
  availability_status: string;
  valid_until: string | null;
  batch: {
    product_type: string;
    variety: string | null;
    quantity: number;
    weight_unit: string;
  };
}

export const BatchPricingManagement = () => {
  const { user } = useAuth();
  const [prices, setPrices] = useState<BatchPrice[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [formData, setFormData] = useState({
    price_per_unit: "",
    currency: "INR",
    msp: "",
    market_rate: "",
    minimum_order_quantity: "",
    negotiable: true,
    discount_percentage: "0",
    availability_status: "available",
    valid_until: ""
  });
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch exporter's batches
      const { data: batchData, error: batchError } = await supabase
        .from("batches")
        .select("*")
        .eq("exporter_id", user?.id)
        .in("status", ["Certified", "Under Inspection"])
        .order("created_at", { ascending: false });

      if (batchError) throw batchError;
      setBatches(batchData || []);

      // Fetch existing prices
      const batchIds = batchData?.map(b => b.id) || [];
      if (batchIds.length > 0) {
        const { data: priceData, error: priceError } = await supabase
          .from("market_prices")
          .select(`
            *,
            batch:batch_id (
              product_type,
              variety,
              quantity,
              weight_unit
            )
          `)
          .in("batch_id", batchIds);

        if (priceError) throw priceError;
        setPrices(priceData || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBatch || !formData.price_per_unit) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const priceData = {
        batch_id: selectedBatch,
        price_per_unit: parseFloat(formData.price_per_unit),
        currency: formData.currency,
        msp: formData.msp ? parseFloat(formData.msp) : null,
        market_rate: formData.market_rate ? parseFloat(formData.market_rate) : null,
        minimum_order_quantity: formData.minimum_order_quantity ? parseFloat(formData.minimum_order_quantity) : null,
        negotiable: formData.negotiable,
        discount_percentage: parseFloat(formData.discount_percentage),
        availability_status: formData.availability_status,
        valid_until: formData.valid_until || null
      };

      if (editingPrice) {
        const { error } = await supabase
          .from("market_prices")
          .update(priceData)
          .eq("id", editingPrice);

        if (error) throw error;
        toast.success("Price updated successfully");
      } else {
        const { error } = await supabase
          .from("market_prices")
          .insert(priceData);

        if (error) throw error;
        toast.success("Price added successfully");
      }

      resetForm();
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving price:", error);
      toast.error("Failed to save price");
    }
  };

  const handleEdit = (price: BatchPrice) => {
    setEditingPrice(price.id);
    setSelectedBatch(price.batch_id);
    setFormData({
      price_per_unit: price.price_per_unit.toString(),
      currency: price.currency,
      msp: price.msp?.toString() || "",
      market_rate: price.market_rate?.toString() || "",
      minimum_order_quantity: price.minimum_order_quantity?.toString() || "",
      negotiable: price.negotiable,
      discount_percentage: price.discount_percentage.toString(),
      availability_status: price.availability_status,
      valid_until: price.valid_until || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (priceId: string) => {
    if (!confirm("Are you sure you want to delete this price?")) return;

    try {
      const { error } = await supabase
        .from("market_prices")
        .delete()
        .eq("id", priceId);

      if (error) throw error;
      toast.success("Price deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting price:", error);
      toast.error("Failed to delete price");
    }
  };

  const resetForm = () => {
    setFormData({
      price_per_unit: "",
      currency: "INR",
      msp: "",
      market_rate: "",
      minimum_order_quantity: "",
      negotiable: true,
      discount_percentage: "0",
      availability_status: "available",
      valid_until: ""
    });
    setSelectedBatch("");
    setEditingPrice(null);
  };

  const getBatchesWithoutPrices = () => {
    const pricesSet = new Set(prices.map(p => p.batch_id));
    return batches.filter(b => !pricesSet.has(b.id));
  };

  if (loading) {
    return <div className="text-center py-8">Loading pricing data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Batch Pricing Management</CardTitle>
              <CardDescription>Set and manage prices for your batches in the marketplace</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Price
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPrice ? "Edit Price" : "Add New Price"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Batch</Label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {(editingPrice ? batches : getBatchesWithoutPrices()).map(batch => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.product_type} {batch.variety ? `- ${batch.variety}` : ""} ({batch.quantity} {batch.weight_unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price per Unit *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter price"
                        value={formData.price_per_unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_per_unit: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>MSP (Minimum Support Price)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        value={formData.msp}
                        onChange={(e) => setFormData(prev => ({ ...prev, msp: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Market Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        value={formData.market_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, market_rate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Minimum Order Quantity</Label>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={formData.minimum_order_quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, minimum_order_quantity: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Discount %</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Availability Status</Label>
                      <Select value={formData.availability_status} onValueChange={(value) => setFormData(prev => ({ ...prev, availability_status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="sold_out">Sold Out</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Valid Until</Label>
                      <Input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.negotiable}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, negotiable: checked }))}
                    />
                    <Label>Price is negotiable</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubmit} className="flex-1">
                      {editingPrice ? "Update Price" : "Add Price"}
                    </Button>
                    <Button variant="outline" onClick={() => { resetForm(); setIsDialogOpen(false); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">MSP</TableHead>
                  <TableHead className="text-right">Market Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell>
                      <div className="font-medium">{price.batch.product_type}</div>
                      {price.batch.variety && (
                        <div className="text-xs text-muted-foreground">{price.batch.variety}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {price.batch.quantity} {price.batch.weight_unit}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ₹{price.price_per_unit.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {price.msp ? `₹${price.msp.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {price.market_rate ? `₹${price.market_rate.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${
                        price.availability_status === "available" ? "bg-green-100 text-green-700" :
                        price.availability_status === "sold_out" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {price.availability_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {price.discount_percentage > 0 ? `${price.discount_percentage}%` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(price)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(price.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {prices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No prices set yet. Add pricing to list batches in marketplace.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
