"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  CssBaseline,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CategoryIcon from "@mui/icons-material/Category";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";

type ProductRow = {
  id: string;
  name: string;
  type?: string;
  sizes: string;
  availableQty: number;
  expectedRevenue: number;
  inventoryCost: number;
};

type OrderRow = {
  id: string;
  client: string;
  address: string;
  city: string;
  phone: string;
  deliveryStatus: string;
};

type ClientOrder = {
  id: string;
  date: string;
  amount: number;
  source: "WEBSITE" | "INSTAGRAM" | "OTHER";
};

type ClientRow = {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orders: ClientOrder[];
};

type ExpenseRow = {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  quantity?: number;
  unit?: string;
  date: string;
};

type Summary = {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyNetProfit: number;
  deliveredOrders: number;
  undeliveredOrders: number;
};

type ProductTypeRow = {
  id: string;
  name: string;
  slug: string;
};

const currency = (value?: number | null) =>
  (value ?? 0).toLocaleString("sq-AL", { style: "currency", currency: "ALL" });

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  const [orderRows, setOrderRows] = useState<OrderRow[]>([]);
  const [clientRows, setClientRows] = useState<ClientRow[]>([]);
  const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    type: "",
    productTypeId: "",
    gender: "UNISEX",
    retailPrice: 0,
    wholesalePrice: 0,
    stock: 0,
    ageFromMonths: 0,
    ageToMonths: 0,
    color: "Multicolor",
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
    salePercent: 0,
    isActive: true,
  });
  const [productTypes, setProductTypes] = useState<ProductTypeRow[]>([]);
  const [newType, setNewType] = useState({ name: "", slug: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, productsRes, ordersRes, clientsRes, expensesRes, typesRes] =
          await Promise.all([
            fetch("/api/admin/summary"),
            fetch("/api/admin/products"),
            fetch("/api/admin/orders"),
            fetch("/api/admin/clients"),
            fetch("/api/admin/expenses"),
            fetch("/api/admin/product-types"),
          ]);

        const summaryJson = await summaryRes.json();
        const productsJson = await productsRes.json();
        const ordersJson = await ordersRes.json();
        const clientsJson = await clientsRes.json();
        const expensesJson = await expensesRes.json();
        const typesJson = await typesRes.json();

        setSummary(summaryJson);
        setProductRows(productsJson.items ?? []);
        setOrderRows(ordersJson.items ?? []);
        setClientRows(clientsJson.items ?? []);
        setExpenseRows(expensesJson.items ?? []);
        setProductTypes(typesJson.items ?? []);
      } catch (e) {
        console.error("Failed to load admin data", e);
      }
    };

    load();
    setMounted(true);
  }, []);

  const revenueStats = useMemo(
    () => [
      { label: "Daily Revenue", value: summary?.dailyRevenue ?? 0, icon: <AttachMoneyIcon /> },
      { label: "Weekly Revenue", value: summary?.weeklyRevenue ?? 0, icon: <TrendingUpIcon /> },
      { label: "Monthly Revenue", value: summary?.monthlyRevenue ?? 0, icon: <TrendingUpIcon /> },
      { label: "Net Profit (Mo)", value: summary?.monthlyNetProfit ?? 0, icon: <ShoppingBagIcon /> },
    ],
    [summary],
  );

  const deliveryStats = useMemo(
    () => [
      { label: "Delivered", value: summary?.deliveredOrders ?? 0, icon: <LocalShippingIcon /> },
      { label: "Undelivered", value: summary?.undeliveredOrders ?? 0, icon: <LocalShippingIcon /> },
    ],
    [summary],
  );

  const productColumns: GridColDef<ProductRow>[] = [
    { field: "id", headerName: "ID", flex: 1, minWidth: 120 },
    { field: "name", headerName: "Name", flex: 1.4, minWidth: 180 },
    { field: "type", headerName: "Type", flex: 0.9, minWidth: 120 },
    { field: "sizes", headerName: "Sizes", flex: 1, minWidth: 160 },
    {
      field: "availableQty",
      headerName: "Available",
      type: "number",
      flex: 0.7,
      minWidth: 120,
    },
    {
      field: "expectedRevenue",
      headerName: "Expected Revenue",
      flex: 1,
      minWidth: 160,
      valueFormatter: ({ value }) => currency(value as number),
    },
    {
      field: "inventoryCost",
      headerName: "Inventory Cost",
      flex: 1,
      minWidth: 160,
      valueFormatter: ({ value }) => currency(value as number),
    },
  ];

  const orderColumns: GridColDef<OrderRow>[] = [
    { field: "id", headerName: "Order ID", flex: 1, minWidth: 140 },
    { field: "client", headerName: "Client", flex: 1.2, minWidth: 150 },
    { field: "address", headerName: "Address", flex: 1.4, minWidth: 180 },
    { field: "city", headerName: "City", flex: 0.8, minWidth: 120 },
    { field: "phone", headerName: "Phone", flex: 1, minWidth: 150 },
    { field: "deliveryStatus", headerName: "Delivery Status", flex: 1, minWidth: 160 },
  ];

  const clientColumns: GridColDef<ClientRow>[] = [
    { field: "name", headerName: "Client", flex: 1.2, minWidth: 160 },
    { field: "email", headerName: "Email", flex: 1.4, minWidth: 200 },
    {
      field: "totalSpent",
      headerName: "Total Spent",
      flex: 1,
      minWidth: 140,
      valueFormatter: ({ value }) => currency(value as number),
    },
  ];

  const expenseColumns: GridColDef<ExpenseRow>[] = [
    { field: "category", headerName: "Category", flex: 1, minWidth: 120 },
    { field: "description", headerName: "Description", flex: 1.4, minWidth: 180 },
    {
      field: "amount",
      headerName: "Amount",
      flex: 0.8,
      minWidth: 120,
      valueFormatter: ({ value }) => currency(value as number),
    },
    { field: "currency", headerName: "Currency", flex: 0.6, minWidth: 100 },
    { field: "quantity", headerName: "Qty", flex: 0.6, minWidth: 80 },
    { field: "unit", headerName: "Unit", flex: 0.6, minWidth: 80 },
    { field: "date", headerName: "Date", flex: 0.9, minWidth: 120 },
  ];

  if (!mounted) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f6fa", p: 3 }}>
      <CssBaseline />
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Admin Dashboard
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setIsAddOpen(true)}
          >
            Add Product
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CategoryIcon />}
            onClick={() => setIsTypeModalOpen(true)}
          >
            Manage Types
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} mb={2}>
        {revenueStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {stat.icon}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {currency(stat.value)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {deliveryStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {stat.icon}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" fontWeight={700}>
              Products (inventory & revenue)
            </Typography>
          </Stack>
          <div style={{ width: "100%", height: 360 }}>
            <DataGrid
              rows={productRows}
              columns={productColumns}
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
            />
          </div>
        </CardContent>
      </Card>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h6" fontWeight={700}>
                  Orders
                </Typography>
              </Stack>
              <div style={{ width: "100%", height: 320 }}>
                <DataGrid
                  rows={orderRows}
                  columns={orderColumns}
                  disableRowSelectionOnClick
                  hideFooterSelectedRowCount
                  pageSizeOptions={[5, 10]}
                  initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={1}>
                Clients
              </Typography>
              <div style={{ width: "100%", height: 320 }}>
                <DataGrid
                  rows={clientRows}
                  columns={clientColumns}
                  disableRowSelectionOnClick
                  hideFooterSelectedRowCount
                  getDetailPanelContent={({ row }) => (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Orders
                      </Typography>
                      <Stack divider={<Divider />} spacing={1}>
                        {row.orders.map((order) => (
                          <Stack
                            key={order.id}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="body2">
                              {order.date} - {order.id} ({order.source})
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {currency(order.amount)}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  )}
                  getDetailPanelHeight={() => "auto"}
                  rowSelection={false}
                  pagination
                  pageSizeOptions={[5, 10]}
                  initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Shop Expenses
          </Typography>
          <div style={{ width: "100%", height: 320 }}>
            <DataGrid
              rows={expenseRows}
              columns={expenseColumns}
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={productForm.name}
              onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Slug"
              value={productForm.slug}
              onChange={(e) => setProductForm((p) => ({ ...p, slug: e.target.value }))}
              fullWidth
              helperText="Unique identifier (e.g. soft-onesie-rose)"
            />
            <FormControl fullWidth>
              <InputLabel id="product-type-label">Product Type</InputLabel>
              <Select
                labelId="product-type-label"
                label="Product Type"
                value={productForm.productTypeId}
                onChange={(e) =>
                  setProductForm((p) => ({
                    ...p,
                    productTypeId: e.target.value,
                    type:
                      productTypes.find((t) => t.id === e.target.value)?.name ??
                      productForm.type,
                  }))
                }
              >
                {productTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                label="Gender"
                value={productForm.gender}
                onChange={(e) => setProductForm((p) => ({ ...p, gender: e.target.value }))}
              >
                <MenuItem value="GIRL">Girl</MenuItem>
                <MenuItem value="BOY">Boy</MenuItem>
                <MenuItem value="NEWBORN">Newborn</MenuItem>
                <MenuItem value="UNISEX">Unisex</MenuItem>
              </Select>
            </FormControl>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Retail Price (ALL)"
                type="number"
                value={productForm.retailPrice}
                onChange={(e) =>
                  setProductForm((p) => ({ ...p, retailPrice: Number(e.target.value) }))
                }
                fullWidth
              />
              <TextField
                label="Wholesale Price (ALL)"
                type="number"
                value={productForm.wholesalePrice}
                onChange={(e) =>
                  setProductForm((p) => ({ ...p, wholesalePrice: Number(e.target.value) }))
                }
                fullWidth
              />
              <TextField
                label="Stock"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Age From (months)"
                type="number"
                value={productForm.ageFromMonths}
                onChange={(e) =>
                  setProductForm((p) => ({ ...p, ageFromMonths: Number(e.target.value) }))
                }
                fullWidth
              />
              <TextField
                label="Age To (months)"
                type="number"
                value={productForm.ageToMonths}
                onChange={(e) =>
                  setProductForm((p) => ({ ...p, ageToMonths: Number(e.target.value) }))
                }
                fullWidth
              />
              <TextField
                label="Color"
                value={productForm.color}
                onChange={(e) => setProductForm((p) => ({ ...p, color: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={productForm.isNew}
                    onChange={(e) => setProductForm((p) => ({ ...p, isNew: e.target.checked }))}
                  />
                }
                label="Is New"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={productForm.isBestSeller}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, isBestSeller: e.target.checked }))
                    }
                  />
                }
                label="Best Seller"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={productForm.isOnSale}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, isOnSale: e.target.checked }))
                    }
                  />
                }
                label="On Sale"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={productForm.isActive}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, isActive: e.target.checked }))
                    }
                  />
                }
                label="Active"
              />
            </Stack>
            {productForm.isOnSale && (
              <TextField
                label="Sale Percent"
                type="number"
                value={productForm.salePercent}
                onChange={(e) =>
                  setProductForm((p) => ({ ...p, salePercent: Number(e.target.value) }))
                }
                fullWidth
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAddOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              setIsSaving(true);
              try {
                await fetch("/api/admin/products", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: productForm.name,
                    slug: productForm.slug,
                    type: productForm.type,
                    productTypeId: productForm.productTypeId || null,
                    gender: productForm.gender,
                    ageFromMonths: productForm.ageFromMonths,
                    ageToMonths: productForm.ageToMonths,
                    isNew: productForm.isNew,
                    isBestSeller: productForm.isBestSeller,
                    isOnSale: productForm.isOnSale,
                    salePercent: productForm.salePercent,
                    isActive: productForm.isActive,
                    variant: {
                      retailPrice: productForm.retailPrice,
                      wholesalePrice: productForm.wholesalePrice,
                      stock: productForm.stock,
                      size: `${productForm.ageFromMonths}-${productForm.ageToMonths}M`,
                      color: productForm.color,
                    },
                  }),
                });
                setIsAddOpen(false);
                setProductForm({
                  name: "",
                  slug: "",
                  type: "",
                  gender: "UNISEX",
                  retailPrice: 0,
                  wholesalePrice: 0,
                  stock: 0,
                  color: "Multicolor",
                  productTypeId: "",
                  ageFromMonths: 0,
                  ageToMonths: 0,
                  isNew: false,
                  isBestSeller: false,
                  isOnSale: false,
                  salePercent: 0,
                  isActive: true,
                });
                // Refresh tables
                const productsRes = await fetch("/api/admin/products");
                const productsJson = await productsRes.json();
                setProductRows(productsJson.items ?? []);
              } catch (e) {
                console.error("Failed to create product", e);
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Manage Product Types</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Name"
                value={newType.name}
                onChange={(e) => setNewType((p) => ({ ...p, name: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Slug"
                value={newType.slug}
                onChange={(e) => setNewType((p) => ({ ...p, slug: e.target.value }))}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    await fetch("/api/admin/product-types", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newType),
                    });
                    const typesRes = await fetch("/api/admin/product-types");
                    const typesJson = await typesRes.json();
                    setProductTypes(typesJson.items ?? []);
                    setNewType({ name: "", slug: "" });
                  } catch (e) {
                    console.error("Failed to add product type", e);
                  }
                }}
                disabled={!newType.name || !newType.slug}
              >
                Add
              </Button>
            </Stack>

            <Typography variant="subtitle2">Existing Types</Typography>
            <Stack spacing={1}>
              {productTypes.map((t) => (
                <Stack
                  key={t.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 1 }}
                >
                  <Typography>{t.name}</Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={async () => {
                      try {
                        await fetch("/api/admin/product-types", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: t.id }),
                        });
                        const typesRes = await fetch("/api/admin/product-types");
                        const typesJson = await typesRes.json();
                        setProductTypes(typesJson.items ?? []);
                      } catch (e) {
                        console.error("Failed to delete product type", e);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTypeModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
