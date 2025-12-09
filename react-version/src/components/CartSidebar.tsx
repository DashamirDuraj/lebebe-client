import { CartItem } from "../types/product";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { useState, useEffect } from "react";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (
    productId: string,
    size: string,
    newQuantity: number,
  ) => void;
  onRemoveItem: (productId: string, size: string) => void;
}

// Albanian cities for the dropdown
const albanianCities = [
  "Tirana",
  "Durrës",
  "Vlorë",
  "Elbasan",
  "Shkodër",
  "Fier",
  "Korçë",
  "Berat",
  "Lushnjë",
  "Kavajë",
  "Pogradec",
  "Laç",
  "Kukës",
  "Krujë",
  "Lezhë",
  "Sarandë",
  "Gjirokastër",
  "Patos",
  "Peshkopi",
  "Kuçovë",
];

export function CartSidebar({
  open,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}: CartSidebarProps) {
  const [showCheckoutForm, setShowCheckoutForm] =
    useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    address: "",
    city: "",
    phone: "",
    verificationCode: "",
  });
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] =
    useState(false);
  const [showVerificationField, setShowVerificationField] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  // Check if all required fields are filled
  const allFieldsFilled =
    formData.name &&
    formData.surname &&
    formData.address &&
    formData.city &&
    formData.phone;

  // Show verification field when all fields are filled
  useEffect(() => {
    if (allFieldsFilled && !showVerificationField) {
      setShowVerificationField(true);
      // Simulate sending SMS code
      console.log(
        "Sending verification code to:",
        formData.phone,
      );
    }
  }, [allFieldsFilled]);

  // Filter cities based on search
  const filteredCities = albanianCities.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase()),
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCitySelect = (city: string) => {
    setFormData((prev) => ({ ...prev, city }));
    setCitySearch(city);
    setShowCityDropdown(false);
  };

  const handleCheckoutClick = () => {
    setShowCheckoutForm(true);
  };

  const handleBackToCart = () => {
    setShowCheckoutForm(false);
    setShowVerificationField(false);
  };

  const handleSubmitOrder = async () => {
    if (!formData.verificationCode) {
      alert(
        "Please enter the verification code sent to your phone",
      );
      return;
    }

    setIsSubmitting(true);

    // Simulate API call to verify code and place order
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderCompleted(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setOrderCompleted(false);
        setShowCheckoutForm(false);
        setFormData({
          name: "",
          surname: "",
          address: "",
          city: "",
          phone: "",
          verificationCode: "",
        });
        setCitySearch("");
        setShowVerificationField(false);
        onClose();
      }, 3000);
    }, 1500);
  };

  // Reset form when cart closes
  useEffect(() => {
    if (!open) {
      setShowCheckoutForm(false);
      setShowVerificationField(false);
      setOrderCompleted(false);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {showCheckoutForm && !orderCompleted && (
              <button
                onClick={handleBackToCart}
                className="hover:opacity-70 transition-opacity"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {orderCompleted
              ? "Order Confirmed!"
              : showCheckoutForm
                ? "Checkout"
                : `Shopping Cart (${cartItems.length})`}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 pt-6 overflow-hidden">
          {orderCompleted ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3
                className="text-2xl mb-2"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                }}
              >
                Thank You!
              </h3>
              <p className="text-neutral-600">
                Your order has been confirmed. You will receive
                a confirmation SMS shortly.
              </p>
            </div>
          ) : showCheckoutForm ? (
            <div className="flex-1 overflow-y-auto px-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    handleInputChange("name", e.target.value)
                  }
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#7CC4E8] transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Surname *
                </label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) =>
                    handleInputChange("surname", e.target.value)
                  }
                  placeholder="Enter your surname"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#7CC4E8] transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    handleInputChange("address", e.target.value)
                  }
                  placeholder="Enter your address"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#7CC4E8] transition-shadow"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setShowCityDropdown(true);
                    if (!e.target.value) {
                      setFormData((prev) => ({
                        ...prev,
                        city: "",
                      }));
                    }
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  placeholder="Search for your city"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#7CC4E8] transition-shadow"
                />
                {showCityDropdown &&
                  filteredCities.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          className="w-full px-4 py-3 text-left hover:bg-[#E6F4FB] transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    handleInputChange("phone", e.target.value)
                  }
                  placeholder="+355 XX XXX XXXX"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#7CC4E8] transition-shadow"
                />
              </div>

              {showVerificationField && (
                <div className="bg-[#E6F4FB] p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-[#7CC4E8] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">
                        !
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 mb-1">
                        Verification Code Sent
                      </p>
                      <p className="text-xs text-neutral-600">
                        We've sent a code to {formData.phone}
                      </p>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData.verificationCode}
                    onChange={(e) =>
                      handleInputChange(
                        "verificationCode",
                        e.target.value,
                      )
                    }
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#7CC4E8] focus:outline-none focus:ring-2 focus:ring-[#7CC4E8] transition-shadow text-center text-lg tracking-widest font-semibold"
                  />
                </div>
              )}

              <div className="pt-4 space-y-3 sticky bottom-0 bg-white pb-4 -mx-6 px-6 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0
                        ? "Free"
                        : `€${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-[#7CC4E8]">
                      €{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {!showVerificationField ? (
                  <p className="text-xs text-neutral-500 text-center">
                    Complete all fields to receive verification
                    code
                  </p>
                ) : (
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={
                      !formData.verificationCode || isSubmitting
                    }
                    className="w-full bg-[#7CC4E8] hover:bg-[#2F8CB7] text-white rounded-xl py-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Confirming Order..."
                      : "Confirm Order"}
                  </Button>
                )}
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 m-[0px]">
                {cartItems.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex gap-4 px-[20px] py-[0px]"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Size: {item.size}
                      </p>
                      <p className="text-rose-500">
                        €{item.product.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            onUpdateQuantity(
                              item.product.id,
                              item.size,
                              item.quantity - 1,
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            onUpdateQuantity(
                              item.product.id,
                              item.size,
                              item.quantity + 1,
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        onRemoveItem(item.product.id, item.size)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-[16px] border-t pr-[10px] pb-[0px] pl-[10px]">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0
                        ? "Free"
                        : `€${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="text-rose-500">
                      €{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {subtotal < 50 && (
                  <p className="text-xs text-gray-500 text-center">
                    Add €{(50 - subtotal).toFixed(2)} more for
                    free shipping!
                  </p>
                )}

                <Button
                  onClick={handleCheckoutClick}
                  className="w-full bg-[#7CC4E8] hover:bg-[#2F8CB7] text-white rounded-xl"
                >
                  Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}