"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  slug?: string;
  type?: string;
  sizes: string;
  availableQty: number;
  expectedRevenue: number;
  inventoryCost: number;
  createdAt?: string;
  updatedAt?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  salePercent?: number | null;
  isActive?: boolean;
};

type OrderRow = {
  id: string;
  client: string;
  address: string;
  city: string;
  phone: string;
  deliveryStatus: string;
};

type OrderFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  paymentType: "CASH_ON_DELIVERY" | "ONLINE";
  source: "WEBSITE" | "INSTAGRAM" | "OTHER";
  status: "PENDING_OTP" | "CONFIRMED" | "CANCELLED";
  deliveryStatus: "PENDING" | "IN_DELIVERY" | "DELIVERED" | "FAILED";
  items: {
    variantId: string;
    quantity: number;
  }[];
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

type InventoryBatchRow = {
  id: string;
  title: string;
  receivedAt: string;
};

type OrderProductOption = {
  variantId: string;
  productName: string;
  size: string;
  color: string;
  price: number;
};

type MediaFormItem = {
  url: string;
  type: "IMAGE" | "VIDEO";
  altText?: string;
  file?: File;
};

type VariantFormItem = {
  id?: string;
  sizeFromMonths: number;
  sizeToMonths: number;
  color: string;
  stock: number;
  newStock: number;
  retailPrice: number;
  wholesalePrice: number;
};

type ProductFormState = {
  name: string;
  slug: string;
  type: string;
  productTypeId: string;
  gender: "GIRL" | "BOY" | "NEWBORN" | "UNISEX";
  variants: VariantFormItem[];
  isNew: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  salePercent: number;
  isActive: boolean;
  media: MediaFormItem[];
  thumbnailIndex: number;
  advertisingSpend: string;
  inventoryBatchId: string;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrderSaving, setIsOrderSaving] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState<OrderFormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
    paymentType: "CASH_ON_DELIVERY",
    source: "WEBSITE",
    status: "CONFIRMED",
    deliveryStatus: "PENDING",
    items: [{ variantId: "", quantity: 1 }],
  });
  const [productForm, setProductForm] = useState<ProductFormState>({
    name: "",
    slug: "",
    type: "",
    productTypeId: "",
    gender: "UNISEX",
    variants: [
      {
        sizeFromMonths: 0,
        sizeToMonths: 0,
        color: "Multicolor",
        stock: 0,
        newStock: 0,
        retailPrice: 0,
        wholesalePrice: 0,
      },
    ],
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
    salePercent: 0,
    isActive: true,
    media: [{ url: "", type: "IMAGE", altText: "" }],
    thumbnailIndex: 0,
    advertisingSpend: "",
    inventoryBatchId: "",
  });
  const [productTypes, setProductTypes] = useState<ProductTypeRow[]>([]);
  const [newType, setNewType] = useState({ name: "", slug: "" });
  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatchRow[]>([]);
  const [newBatch, setNewBatch] = useState({ title: "", receivedAt: "" });
  const [orderProductOptions, setOrderProductOptions] = useState<OrderProductOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const refreshOrderOptions = async () => {
    try {
      const res = await fetch("/api/admin/orders/options");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Failed to load order product options");
      }
      setOrderProductOptions(json.items ?? []);
    } catch (e) {
      console.error("Failed to load order product options", e);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [
          summaryRes,
          productsRes,
          ordersRes,
          clientsRes,
          expensesRes,
          typesRes,
          batchesRes,
          orderOptionsRes,
        ] =
          await Promise.all([
            fetch("/api/admin/summary"),
            fetch("/api/admin/products"),
            fetch("/api/admin/orders"),
            fetch("/api/admin/clients"),
            fetch("/api/admin/expenses"),
            fetch("/api/admin/product-types"),
            fetch("/api/admin/inventory-batches"),
            fetch("/api/admin/orders/options"),
          ]);

        const summaryJson = await summaryRes.json();
        const productsJson = await productsRes.json();
        const ordersJson = await ordersRes.json();
        const clientsJson = await clientsRes.json();
        const expensesJson = await expensesRes.json();
        const typesJson = await typesRes.json();
        const batchesJson = await batchesRes.json();
        const orderOptionsJson = await orderOptionsRes.json();

        setSummary(summaryJson);
        setProductRows(productsJson.items ?? []);
        setOrderRows(ordersJson.items ?? []);
        setClientRows(clientsJson.items ?? []);
        setExpenseRows(expensesJson.items ?? []);
        setProductTypes(typesJson.items ?? []);
        setInventoryBatches(batchesJson.items ?? []);
        setOrderProductOptions(orderOptionsJson.items ?? []);
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

  const orderTotal = useMemo(() => {
    const priceMap = new Map(orderProductOptions.map((o) => [o.variantId, o.price]));
    return orderForm.items.reduce((sum, item) => {
      if (!item.variantId) return sum;
      const price = priceMap.get(item.variantId) ?? 0;
      return sum + price * (item.quantity || 0);
    }, 0);
  }, [orderForm.items, orderProductOptions]);

  const productColumns: GridColDef<ProductRow>[] = [
    {
      field: "actions",
      headerName: "",
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              (async () => {
                if (!row.id) return;
                setEditingId(row.id);
                try {
                  const res = await fetch(`/api/admin/products/${row.id}`);
                  const json = await res.json();
                  if (!res.ok) {
                    console.error("Failed to load product detail", json?.message);
                    return;
                  }
                  if (json.product) {
                    const p = json.product;
                    const matchedTypeId =
                      p.productTypeId ||
                      productTypes.find((t) => t.name === p.type || t.id === p.productTypeId)?.id ||
                      "";
                    const variants =
                      p.variants && Array.isArray(p.variants) && p.variants.length > 0
                        ? p.variants.map((variant: any) => ({
                            id: variant.id,
                            sizeFromMonths: Number(variant.sizeFromMonths ?? 0),
                            sizeToMonths: Number(variant.sizeToMonths ?? 0),
                            color: variant.color ?? "Multicolor",
                            stock: Number(variant.stock ?? 0),
                            newStock: 0,
                            retailPrice: Number(variant.retailPrice ?? 0),
                            wholesalePrice: Number(variant.wholesalePrice ?? 0),
                          }))
                        : [
                            {
                        sizeFromMonths: 0,
                        sizeToMonths: 0,
                        color: "Multicolor",
                        stock: 0,
                        newStock: 0,
                        retailPrice: 0,
                        wholesalePrice: 0,
                      },
                          ];
                    setProductForm({
                      name: p.name ?? "",
                      slug: p.slug ?? "",
                      type: p.type ?? productTypes.find((t) => t.id === matchedTypeId)?.name ?? "",
                      productTypeId: matchedTypeId,
                      gender: p.gender ?? "UNISEX",
                      variants,
                      isNew: !!p.isNew,
                      isBestSeller: !!p.isBestSeller,
                      isOnSale: !!p.isOnSale,
                      salePercent: p.salePercent ?? 0,
                      isActive: p.isActive ?? true,
                    media:
                      p.media && Array.isArray(p.media) && p.media.length > 0
                        ? p.media.map((m: any) => ({
                            url: m.url ?? "",
                            type: m.type ?? "IMAGE",
                            altText: m.altText ?? "",
                          }))
                        : [{ url: "", type: "IMAGE", altText: "" }],
                    thumbnailIndex: 0,
                    advertisingSpend: "",
                    inventoryBatchId: "",
                  });
                    setIsAddOpen(true);
                  }
                } catch (e) {
                  console.error("Failed to load product detail", e);
                }
              })();
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            variant="text"
            disabled={deletingId === row.id}
            onClick={() => {
              (async () => {
                if (!row.id) return;
                const confirmDelete = window.confirm("Delete this product? This cannot be undone.");
                if (!confirmDelete) return;
                setDeletingId(row.id);
                try {
                  const res = await fetch(`/api/admin/products/${row.id}`, { method: "DELETE" });
                  if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    console.error("Failed to delete product", json?.message);
                    return;
                  }
                  const productsRes = await fetch("/api/admin/products");
                  const productsJson = await productsRes.json();
                  setProductRows(productsJson.items ?? []);
                  await refreshOrderOptions();
                } catch (e) {
                  console.error("Failed to delete product", e);
                } finally {
                  setDeletingId(null);
                }
              })();
            }}
          >
            Delete
          </Button>
        </Stack>
      ),
      sortable: false,
      width: 140,
    },
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
    {
      field: "createdAt",
      headerName: "Created",
      flex: 0.9,
      minWidth: 140,
      valueFormatter: ({ value }) =>
        value ? new Date(value as string).toLocaleDateString("en-GB") : "",
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      flex: 0.9,
      minWidth: 140,
      valueFormatter: ({ value }) =>
        value ? new Date(value as string).toLocaleDateString("en-GB") : "",
    },
  ];

  const orderColumns: GridColDef<OrderRow>[] = [
    {
      field: "actions",
      headerName: "",
      sortable: false,
      width: 140,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              (async () => {
                if (!row.id) return;
                setEditingOrderId(row.id);
                try {
                  const res = await fetch(`/api/admin/orders/${row.id}`);
                  const json = await res.json();
                  if (!res.ok) {
                    console.error("Failed to load order detail", json?.message);
                    return;
                  }
                  if (json.order) {
                    const o = json.order;
                    setOrderForm({
                      firstName: o.firstName ?? "",
                      lastName: o.lastName ?? "",
                      email: o.email ?? "",
                      phone: o.phone ?? "",
                      address: o.address ?? "",
                      city: o.city ?? "",
                      postalCode: o.postalCode ?? "",
                      notes: o.notes ?? "",
                      paymentType: o.paymentType ?? "CASH_ON_DELIVERY",
                      source: o.source ?? "WEBSITE",
                      status: o.status ?? "CONFIRMED",
                      deliveryStatus: o.deliveryStatus ?? "PENDING",
                      items:
                        o.items && Array.isArray(o.items) && o.items.length > 0
                          ? o.items.map((item: any) => ({
                              variantId: item.variantId ?? "",
                              quantity: Number(item.quantity ?? 1),
                            }))
                          : [{ variantId: "", quantity: 1 }],
                    });
                    setIsOrderModalOpen(true);
                  }
                } catch (e) {
                  console.error("Failed to load order detail", e);
                }
              })();
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            variant="text"
            disabled={deletingOrderId === row.id}
            onClick={() => {
              (async () => {
                if (!row.id) return;
                const confirmDelete = window.confirm("Delete this order? This cannot be undone.");
                if (!confirmDelete) return;
                setDeletingOrderId(row.id);
                try {
                  const res = await fetch(`/api/admin/orders/${row.id}`, {
                    method: "DELETE",
                  });
                  if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    console.error("Failed to delete order", json?.message);
                    return;
                  }
                  const ordersRes = await fetch("/api/admin/orders");
                  const ordersJson = await ordersRes.json();
                  setOrderRows(ordersJson.items ?? []);
                } catch (e) {
                  console.error("Failed to delete order", e);
                } finally {
                  setDeletingOrderId(null);
                }
              })();
            }}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
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
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingId(null);
                  setProductForm({
                    name: "",
                    slug: "",
                    type: "",
                    productTypeId: "",
                    gender: "UNISEX",
                    variants: [
                      {
                        sizeFromMonths: 0,
                        sizeToMonths: 0,
                        color: "Multicolor",
                        stock: 0,
                        newStock: 0,
                        retailPrice: 0,
                        wholesalePrice: 0,
                      },
                    ],
                    isNew: false,
                    isBestSeller: false,
                    isOnSale: false,
                    salePercent: 0,
                    isActive: true,
                    media: [{ url: "", type: "IMAGE", altText: "" }],
                    thumbnailIndex: 0,
                    advertisingSpend: "",
                    inventoryBatchId: "",
                  });
                  setIsAddOpen(true);
                }}
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={2}>
            <TextField
              size="small"
              label="Inventory Title"
              value={newBatch.title}
              onChange={(e) => setNewBatch((p) => ({ ...p, title: e.target.value }))}
              fullWidth
            />
            <TextField
              size="small"
              label="Received Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newBatch.receivedAt}
              onChange={(e) => setNewBatch((p) => ({ ...p, receivedAt: e.target.value }))}
              fullWidth
            />
            <Button
              variant="outlined"
              size="small"
              onClick={async () => {
                try {
                  await fetch("/api/admin/inventory-batches", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newBatch),
                  });
                  const batchesRes = await fetch("/api/admin/inventory-batches");
                  const batchesJson = await batchesRes.json();
                  setInventoryBatches(batchesJson.items ?? []);
                  setNewBatch({ title: "", receivedAt: "" });
                } catch (e) {
                  console.error("Failed to add inventory batch", e);
                }
              }}
              disabled={!newBatch.title || !newBatch.receivedAt}
            >
              Add Inventory
            </Button>
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
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    refreshOrderOptions();
                    setEditingOrderId(null);
                    setOrderForm({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      address: "",
                      city: "",
                      postalCode: "",
                      notes: "",
                      paymentType: "CASH_ON_DELIVERY",
                      source: "WEBSITE",
                      status: "CONFIRMED",
                      deliveryStatus: "PENDING",
                      items: [{ variantId: "", quantity: 1 }],
                    });
                    setIsOrderModalOpen(true);
                  }}
                >
                  Add Order
                </Button>
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
        <DialogTitle>{editingId ? "Update Product" : "Add Product"}</DialogTitle>
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
            <FormControl fullWidth>
              <InputLabel id="inventory-batch-label">Inventory Batch</InputLabel>
              <Select
                labelId="inventory-batch-label"
                label="Inventory Batch"
                value={productForm.inventoryBatchId}
                onChange={(e) =>
                  setProductForm((p) => ({ ...p, inventoryBatchId: e.target.value }))
                }
              >
                <MenuItem value="">Select batch...</MenuItem>
                {inventoryBatches.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>
                    {batch.title} ({batch.receivedAt})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Variants</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    setProductForm((p) => ({
                      ...p,
                      variants: [
                        ...p.variants,
                        {
                          sizeFromMonths: 0,
                          sizeToMonths: 0,
                          color: "Multicolor",
                          stock: 0,
                          newStock: 0,
                          retailPrice: 0,
                          wholesalePrice: 0,
                        },
                      ],
                    }))
                  }
                >
                  Add Variant
                </Button>
              </Stack>
              {productForm.variants.map((variant, idx) => (
                <Stack
                  key={variant.id ?? idx}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems="center"
                >
                  <TextField
                    label="From (months)"
                    type="number"
                    value={variant.sizeFromMonths}
                    onChange={(e) =>
                      setProductForm((p) => {
                        const variants = [...p.variants];
                        variants[idx] = {
                          ...variants[idx],
                          sizeFromMonths: Number(e.target.value),
                        };
                        return { ...p, variants };
                      })
                    }
                  />
                  <TextField
                    label="To (months)"
                    type="number"
                    value={variant.sizeToMonths}
                    onChange={(e) =>
                      setProductForm((p) => {
                        const variants = [...p.variants];
                        variants[idx] = {
                          ...variants[idx],
                          sizeToMonths: Number(e.target.value),
                        };
                        return { ...p, variants };
                      })
                    }
                  />
                  <TextField
                    label="Color"
                    value={variant.color}
                    onChange={(e) =>
                      setProductForm((p) => {
                        const variants = [...p.variants];
                        variants[idx] = { ...variants[idx], color: e.target.value };
                        return { ...p, variants };
                      })
                    }
                  />
                  {editingId && variant.id ? (
                    <>
                      <TextField label="Current Qty" type="number" value={variant.stock} disabled />
                      <TextField
                        label="New Qty"
                        type="number"
                        value={variant.newStock}
                        onChange={(e) =>
                          setProductForm((p) => {
                            const variants = [...p.variants];
                            variants[idx] = {
                              ...variants[idx],
                              newStock: Number(e.target.value),
                            };
                            return { ...p, variants };
                          })
                        }
                      />
                    </>
                  ) : (
                    <TextField
                      label="Qty"
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        setProductForm((p) => {
                          const variants = [...p.variants];
                          variants[idx] = { ...variants[idx], stock: Number(e.target.value) };
                          return { ...p, variants };
                        })
                      }
                    />
                  )}
                  <TextField
                    label="Retail (ALL)"
                    type="number"
                    value={variant.retailPrice}
                    onChange={(e) =>
                      setProductForm((p) => {
                        const variants = [...p.variants];
                        variants[idx] = { ...variants[idx], retailPrice: Number(e.target.value) };
                        return { ...p, variants };
                      })
                    }
                  />
                  <TextField
                    label="Wholesale (ALL)"
                    type="number"
                    value={variant.wholesalePrice}
                    onChange={(e) =>
                      setProductForm((p) => {
                        const variants = [...p.variants];
                        variants[idx] = {
                          ...variants[idx],
                          wholesalePrice: Number(e.target.value),
                        };
                        return { ...p, variants };
                      })
                    }
                  />
                  <Button
                    color="error"
                    onClick={() =>
                      setProductForm((p) => {
                        if (p.variants.length === 1) {
                          return p;
                        }
                        const variants = [...p.variants];
                        variants.splice(idx, 1);
                        return { ...p, variants };
                      })
                    }
                  >
                    Remove
                  </Button>
                </Stack>
              ))}
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
            {editingId && (
              <TextField
                label="Advertising Spend (ALL)"
                type="number"
                value={productForm.advertisingSpend}
                onChange={(e) =>
                  setProductForm((p) => ({ ...p, advertisingSpend: e.target.value }))
                }
                helperText="This value will be logged as a new ad expense for this product."
                fullWidth
              />
            )}
            <Divider />
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Media</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      setProductForm((p) => ({
                        ...p,
                        media: [...(p.media ?? []), { url: "", type: "IMAGE", altText: "" }],
                      }))
                    }
                  >
                    Add Media (URL)
                  </Button>
                  <Button size="small" variant="contained" onClick={() => fileInputRef.current?.click()}>
                    Upload from device
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      setProductForm((p) => {
                        const existing = [...(p.media ?? [])];
                        const newItems: MediaFormItem[] = Array.from(files).map((file) => ({
                          url: "",
                          type: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
                          altText: file.name,
                          file,
                        }));
                        return { ...p, media: [...existing, ...newItems] };
                      });
                      e.target.value = "";
                    }}
                  />
                </Stack>
              </Stack>
              {(productForm.media ?? []).map((m, idx) => (
                <Stack
                  key={idx}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems="center"
                >
                  <TextField
                    label="Media URL"
                    value={m.url}
                    onChange={(e) =>
                      setProductForm((p) => {
                        const media = [...(p.media ?? [])];
                        media[idx] = { ...media[idx], url: e.target.value };
                        return { ...p, media };
                      })
                    }
                    fullWidth
                  />
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id={`media-type-${idx}`}>Type</InputLabel>
                    <Select
                      labelId={`media-type-${idx}`}
                      label="Type"
                      value={m.type}
                      onChange={(e) =>
                        setProductForm((p) => {
                          const media = [...(p.media ?? [])];
                          media[idx] = { ...media[idx], type: e.target.value as string };
                          return { ...p, media };
                        })
                      }
                    >
                      <MenuItem value="IMAGE">Image</MenuItem>
                      <MenuItem value="VIDEO">Video</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Alt text"
                    value={m.altText}
                    onChange={(e) =>
                      setProductForm((p) => {
                        const media = [...(p.media ?? [])];
                        media[idx] = { ...media[idx], altText: e.target.value };
                        return { ...p, media };
                      })
                    }
                    fullWidth
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={productForm.thumbnailIndex === idx}
                        onChange={() =>
                          setProductForm((p) => ({ ...p, thumbnailIndex: idx }))
                        }
                      />
                    }
                    label="Thumbnail"
                  />
                  <Button
                    color="error"
                    onClick={() =>
                      setProductForm((p) => {
                        const media = [...(p.media ?? [])];
                        media.splice(idx, 1);
                        return {
                          ...p,
                          media: media.length ? media : [{ url: "", type: "IMAGE", altText: "" }],
                          thumbnailIndex: 0,
                        };
                      })
                    }
                  >
                    Remove
                  </Button>
                </Stack>
              ))}
            </Stack>
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
                if (!productForm.slug) {
                  alert("Slug is required before uploading media");
                  setIsSaving(false);
                  return;
                }

                const hasStockChanges = editingId
                  ? productForm.variants.some(
                      (variant) =>
                        (variant.newStock ?? 0) > 0 || (!variant.id && variant.stock > 0),
                    )
                  : productForm.variants.some((variant) => variant.stock > 0);
                if (hasStockChanges && !productForm.inventoryBatchId) {
                  alert("Select an inventory batch for stock changes.");
                  setIsSaving(false);
                  return;
                }

                const uploadables = (productForm.media ?? [])
                  .map((m, idx) =>
                    m.file
                      ? {
                          index: idx,
                          file: m.file,
                          isThumbnail: idx === productForm.thumbnailIndex,
                          contentType: m.file.type || "application/octet-stream",
                        }
                      : null,
                  )
                  .filter(Boolean) as {
                  index: number;
                  file: File;
                  isThumbnail: boolean;
                  contentType: string;
                }[];

                const uploadedMap = new Map<
                  number,
                  {
                    originalPublicUrl: string;
                    thumbnailPublicUrl?: string;
                    contentType: string;
                  }
                >();

                if (uploadables.length > 0) {
                  const form = new FormData();
                  form.append("slug", productForm.slug);
                  form.append(
                    "manifest",
                    JSON.stringify(
                      uploadables.map((u) => ({
                        index: u.index,
                        fileName: u.file.name,
                        contentType: u.contentType,
                        isThumbnail: u.isThumbnail,
                      })),
                    ),
                  );
                  uploadables.forEach((u) => {
                    form.append(`file-${u.index}`, u.file);
                  });

                  const directRes = await fetch("/api/admin/uploads/direct", {
                    method: "POST",
                    body: form,
                  });

                  const directJson = await directRes.json();
                  if (!directRes.ok) {
                    throw new Error(directJson?.message || "Failed to upload files");
                  }

                  const uploads = directJson.uploads as Array<{
                    index: number;
                    originalUrl: string;
                    thumbnailUrl?: string;
                  }>;

                  for (const upload of uploads) {
                    uploadedMap.set(upload.index, {
                      originalPublicUrl: upload.originalUrl,
                      thumbnailPublicUrl: upload.thumbnailUrl,
                      contentType: "",
                    });
                  }
                }

                const payload = {
                  name: productForm.name,
                  slug: productForm.slug,
                  type: productForm.type,
                  productTypeId: productForm.productTypeId || null,
                  gender: productForm.gender,
                  isNew: productForm.isNew,
                  isBestSeller: productForm.isBestSeller,
                  isOnSale: productForm.isOnSale,
                  salePercent: productForm.salePercent,
                  isActive: productForm.isActive,
                  inventoryBatchId: productForm.inventoryBatchId || null,
                  variants: productForm.variants.map((variant) => ({
                    id: variant.id,
                    sizeFromMonths: variant.sizeFromMonths,
                    sizeToMonths: variant.sizeToMonths,
                    color: variant.color,
                    stock: variant.stock,
                    addStock: editingId ? variant.newStock : undefined,
                    retailPrice: variant.retailPrice,
                    wholesalePrice: variant.wholesalePrice,
                  })),
                  advertisingSpend: editingId ? productForm.advertisingSpend : undefined,
                  media: (productForm.media ?? []).map((m, idx) => {
                    const uploaded = uploadedMap.get(idx);
                    const url =
                      uploaded && productForm.thumbnailIndex === idx && uploaded.thumbnailPublicUrl
                        ? uploaded.thumbnailPublicUrl
                        : uploaded?.originalPublicUrl ?? m.url;
                    return {
                      url,
                      type: m.type,
                      altText: m.altText,
                      isThumbnail: idx === productForm.thumbnailIndex,
                    };
                  }),
                };

                if (editingId) {
                  await fetch(`/api/admin/products/${editingId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                } else {
                  await fetch("/api/admin/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                }
                setIsAddOpen(false);
                setEditingId(null);
                setProductForm({
                  name: "",
                  slug: "",
                  type: "",
                  gender: "UNISEX",
                  productTypeId: "",
                  variants: [
                    {
                      sizeFromMonths: 0,
                      sizeToMonths: 0,
                      color: "Multicolor",
                      stock: 0,
                      newStock: 0,
                      retailPrice: 0,
                      wholesalePrice: 0,
                    },
                  ],
                  isNew: false,
                  isBestSeller: false,
                  isOnSale: false,
                  salePercent: 0,
                  isActive: true,
                  media: [{ url: "", type: "IMAGE", altText: "" }],
                  thumbnailIndex: 0,
                  advertisingSpend: "",
                  inventoryBatchId: "",
                });
                const productsRes = await fetch("/api/admin/products");
                const productsJson = await productsRes.json();
                setProductRows(productsJson.items ?? []);
                await refreshOrderOptions();
              } catch (e) {
                console.error("Failed to save product", e);
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : editingId ? "Update" : "Create"}
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

      <Dialog
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingOrderId ? "Update Order" : "Add Order"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="First Name"
                value={orderForm.firstName}
                onChange={(e) => setOrderForm((p) => ({ ...p, firstName: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Last Name"
                value={orderForm.lastName}
                onChange={(e) => setOrderForm((p) => ({ ...p, lastName: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Email"
                value={orderForm.email}
                onChange={(e) => setOrderForm((p) => ({ ...p, email: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Phone"
                value={orderForm.phone}
                onChange={(e) => setOrderForm((p) => ({ ...p, phone: e.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              label="Address"
              value={orderForm.address}
              onChange={(e) => setOrderForm((p) => ({ ...p, address: e.target.value }))}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="City"
                value={orderForm.city}
                onChange={(e) => setOrderForm((p) => ({ ...p, city: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Postal Code"
                value={orderForm.postalCode}
                onChange={(e) => setOrderForm((p) => ({ ...p, postalCode: e.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              label="Notes"
              value={orderForm.notes}
              onChange={(e) => setOrderForm((p) => ({ ...p, notes: e.target.value }))}
              fullWidth
            />
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Items</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    setOrderForm((p) => ({
                      ...p,
                      items: [...p.items, { variantId: "", quantity: 1 }],
                    }))
                  }
                >
                  Add Item
                </Button>
              </Stack>
              {orderForm.items.map((item, idx) => (
                <Stack
                  key={`${item.variantId}-${idx}`}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems="center"
                >
                  <FormControl fullWidth>
                    <InputLabel id={`order-item-${idx}`}>Product</InputLabel>
                    <Select
                      labelId={`order-item-${idx}`}
                      label="Product"
                      value={item.variantId}
                      onChange={(e) =>
                        setOrderForm((p) => {
                          const items = [...p.items];
                          items[idx] = { ...items[idx], variantId: e.target.value };
                          return { ...p, items };
                        })
                      }
                    >
                      {orderProductOptions.length === 0 ? (
                        <MenuItem value="" disabled>
                          No variants available. Add product variants first.
                        </MenuItem>
                      ) : (
                        orderProductOptions.map((option) => (
                          <MenuItem key={option.variantId} value={option.variantId}>
                            {option.productName} - {option.size} / {option.color} (
                            {currency(option.price)})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      setOrderForm((p) => {
                        const items = [...p.items];
                        items[idx] = { ...items[idx], quantity: Number(e.target.value) };
                        return { ...p, items };
                      })
                    }
                  />
                  <Button
                    color="error"
                    onClick={() =>
                      setOrderForm((p) => {
                        if (p.items.length === 1) {
                          return p;
                        }
                        const items = [...p.items];
                        items.splice(idx, 1);
                        return { ...p, items };
                      })
                    }
                  >
                    Remove
                  </Button>
                </Stack>
              ))}
            </Stack>
            <TextField
              label="Total Amount (ALL)"
              type="number"
              value={orderTotal}
              disabled
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="order-payment-label">Payment</InputLabel>
                <Select
                  labelId="order-payment-label"
                  label="Payment"
                  value={orderForm.paymentType}
                  onChange={(e) =>
                    setOrderForm((p) => ({
                      ...p,
                      paymentType: e.target.value as OrderFormState["paymentType"],
                    }))
                  }
                >
                  <MenuItem value="CASH_ON_DELIVERY">Cash</MenuItem>
                  <MenuItem value="ONLINE">Online</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="order-source-label">Source</InputLabel>
                <Select
                  labelId="order-source-label"
                  label="Source"
                  value={orderForm.source}
                  onChange={(e) =>
                    setOrderForm((p) => ({
                      ...p,
                      source: e.target.value as OrderFormState["source"],
                    }))
                  }
                >
                  <MenuItem value="WEBSITE">Website</MenuItem>
                  <MenuItem value="INSTAGRAM">Instagram</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="order-status-label">Status</InputLabel>
                <Select
                  labelId="order-status-label"
                  label="Status"
                  value={orderForm.status}
                  onChange={(e) =>
                    setOrderForm((p) => ({
                      ...p,
                      status: e.target.value as OrderFormState["status"],
                    }))
                  }
                >
                  <MenuItem value="PENDING_OTP">Pending OTP</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="order-delivery-label">Delivery</InputLabel>
                <Select
                  labelId="order-delivery-label"
                  label="Delivery"
                  value={orderForm.deliveryStatus}
                  onChange={(e) =>
                    setOrderForm((p) => ({
                      ...p,
                      deliveryStatus: e.target.value as OrderFormState["deliveryStatus"],
                    }))
                  }
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="IN_DELIVERY">In Delivery</MenuItem>
                  <MenuItem value="DELIVERED">Delivered</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsOrderModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isOrderSaving}
            onClick={async () => {
              setIsOrderSaving(true);
              try {
                const items = orderForm.items.filter(
                  (item) => item.variantId && item.quantity > 0,
                );
                if (items.length === 0) {
                  alert("Add at least one order item.");
                  setIsOrderSaving(false);
                  return;
                }
                const payload = { ...orderForm, items };
                if (editingOrderId) {
                  await fetch(`/api/admin/orders/${editingOrderId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                } else {
                  await fetch("/api/admin/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                }
                setIsOrderModalOpen(false);
                setEditingOrderId(null);
                setOrderForm({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  address: "",
                  city: "",
                  postalCode: "",
                  notes: "",
                  paymentType: "CASH_ON_DELIVERY",
                  source: "WEBSITE",
                  status: "CONFIRMED",
                  deliveryStatus: "PENDING",
                  items: [{ variantId: "", quantity: 1 }],
                });
                const ordersRes = await fetch("/api/admin/orders");
                const ordersJson = await ordersRes.json();
                setOrderRows(ordersJson.items ?? []);
              } catch (e) {
                console.error("Failed to save order", e);
              } finally {
                setIsOrderSaving(false);
              }
            }}
          >
            {isOrderSaving ? "Saving..." : editingOrderId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
