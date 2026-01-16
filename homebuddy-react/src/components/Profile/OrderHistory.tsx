import { Package, ChevronDown, ChevronUp, X, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";

interface OrderHistoryProps {
  orders: any[];
  isLoading?: boolean;
}

const OrderHistory = ({ orders, isLoading = false }: OrderHistoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Update items to show based on screen size
  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth >= 1024) {
        setItemsToShow(3); // lg: 3 columns
      } else if (window.innerWidth >= 768) {
        setItemsToShow(2); // md: 2 columns
      } else {
        setItemsToShow(1); // mobile: 1 column
      }
    };

    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  // Calculate total items in an order
  const getTotalItems = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine if we need to show the expand button
  const showExpandButton = orders.length > itemsToShow;

  // Get orders to display based on expanded state
  const hiddenOrders = orders.slice(itemsToShow);

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setCopied(false);
  };

  const handleCopyOrderNumber = async () => {
    if (selectedOrder) {
      try {
        await navigator.clipboard.writeText(selectedOrder.orderNo);
        setCopied(true);
        toast.success("Order number copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy order number");
      }
    }
  };

  const OrderCard = ({ order }: { order: any }) => (
    <div
      onClick={() => setSelectedOrder(order)}
      className="group p-4 md:p-5 cursor-pointer bg-[#171010] hover:-translate-y-2 transition-transform duration-300 border border-[#423F3E] hover:border-[#8B4513]"
    >
      <div className="w-full h-40 bg-[#2B2B2B] border border-[#423F3E] mb-4 flex items-center justify-center group-hover:border-[#8B4513] transition-colors">
        <Package className="w-16 h-16 text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg uppercase tracking-wider truncate">
              {order.orderNo}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-400 text-sm font-medium">
                {formatDate(order.createdUtc)}
              </p>
              <span
                className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${
                  order.status === "Pending"
                    ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700/50"
                    : order.status === "Delivered"
                    ? "bg-green-900/50 text-green-300 border border-green-700/50"
                    : "bg-gray-700/50 text-gray-300 border border-gray-600/50"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t-2 border-[#423F3E]">
          <span className="text-gray-400 text-sm font-medium uppercase">
            {getTotalItems(order.items)} items
          </span>
          <span className="text-white font-bold text-lg">
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  const modalContent = selectedOrder ? (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-9999 backdrop-blur-sm"
      onClick={handleCloseModal}
    >
      <div
        className="p-6 md:p-10 max-w-2xl w-full bg-[#171010] border-2 border-[#8B4513] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Package
              className="w-8 h-8 text-[#8B4513] shrink-0"
              strokeWidth={2}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#423F3E] scrollbar-track-transparent hover:scrollbar-thumb-[#8B4513] flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider whitespace-nowrap">
                    {selectedOrder.orderNo}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {formatDate(selectedOrder.createdUtc)}
              </p>
            </div>
          </div>
          <div className="ml-4">
            <button
              onClick={handleCopyOrderNumber}
              className="p-2 bg-[#2B2B2B] hover:bg-[#423F3E] border border-[#423F3E] hover:border-[#8B4513] text-gray-300 hover:text-white transition-all shrink-0"
              aria-label="Copy order number"
              title="Copy order number"
            >
              {copied ? (
                <Check size={18} className="text-green-400" />
              ) : (
                <Copy size={18} />
              )}
            </button>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-white transition-colors p-2 ml-1 shrink-0"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status and Total */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-[#423F3E]">
          <span
            className={`px-4 py-2 text-sm font-bold uppercase tracking-widest ${
              selectedOrder.status === "Pending"
                ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700/50"
                : selectedOrder.status === "Delivered"
                ? "bg-green-900/50 text-green-300 border border-green-700/50"
                : "bg-gray-700/50 text-gray-300 border border-gray-600/50"
            }`}
          >
            {selectedOrder.status}
          </span>
          <div className="text-right">
            <p className="text-gray-400 text-sm uppercase tracking-wider">
              Total
            </p>
            <p className="text-white font-bold text-2xl">
              ${selectedOrder.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
            Order Items ({selectedOrder.items.length})
          </h4>
          <div className="space-y-4">
            {selectedOrder.items.map((item: any, index: number) => (
              <div
                key={item.id}
                className="p-4 bg-[#2B2B2B] border border-[#423F3E] hover:border-[#8B4513] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-white font-bold uppercase tracking-wide">
                      Item #{index + 1}
                    </p>
                    <p className="text-gray-400 text-sm mt-1 font-mono">
                      Variant ID: {item.variantId}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-gray-400 text-sm">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-white font-bold">
                      ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#423F3E] flex justify-between items-center">
                  <span className="text-gray-400 text-sm uppercase">
                    Subtotal
                  </span>
                  <span className="text-white font-bold">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email */}
        <div className="mt-6 pt-6 border-t-2 border-[#423F3E]">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">
            Order Email
          </p>
          <p className="text-white font-mono">{selectedOrder.email}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="w-full mt-6 px-6 py-4 bg-[#8B4513] hover:bg-[#6d3410] text-white font-bold transition-all active:scale-95 uppercase tracking-widest text-sm"
        >
          Close
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="p-4 md:p-10 bg-[#2B2B2B] border border-[#423F3E]">
        <div className="flex justify-between items-center gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <Package
              className="w-6 h-6 md:w-7 md:h-7 text-gray-300"
              strokeWidth={2}
            />
            <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">
              Order History
            </h2>
          </div>
          {showExpandButton && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 bg-[#171010] hover:bg-[#423F3E] text-gray-300 hover:text-white border border-[#423F3E] hover:border-[#8B4513] transition-all font-bold uppercase tracking-widest text-xs"
            >
              {isExpanded ? (
                <>
                  View Less
                  <ChevronUp size={16} />
                </>
              ) : (
                <>
                  View More
                  <ChevronDown size={16} />
                </>
              )}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400 font-mono">
            LOADING ORDER HISTORY...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-2xl font-bold mb-2">NO ORDERS FOUND</p>
            <p>
              Your past orders will appear here once you've made a purchase.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Always visible orders */}
            {orders.slice(0, itemsToShow).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}

            {/* Expandable orders with animation */}
            <div
              className={`col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 transition-all duration-500 ease-in-out overflow-hidden ${
                isExpanded ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {hiddenOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>

      {typeof document !== "undefined" &&
        createPortal(modalContent, document.body)}
    </>
  );
};

export default OrderHistory;
