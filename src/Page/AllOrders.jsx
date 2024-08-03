import React, { useEffect, useState } from "react";
import PaymentOrderApi from "../common/order";
import moment from "moment";
import displayINRCurrency from "../helper/displayCurrency";
import { MdDelete } from "react-icons/md";

function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [currentProductId, setCurrentProductId] = useState(null);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(PaymentOrderApi.allOrder.url, {
        method: PaymentOrderApi.allOrder.method,
        credentials: "include",
      });

      const dataResponse = await response.json();

      if (response.ok) {
        const { orders, users } = dataResponse.data;
        setOrders(orders);
        setUsers(users);
      } else {
        console.error("Error fetching orders:", dataResponse.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleDeleteClick = (productId) => {
    setCurrentProductId(productId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!cancelReason) {
      alert("Please provide a reason for cancellation");
      return;
    }

    try {
      const response = await fetch(PaymentOrderApi.cancelOrder.url, {
        method: PaymentOrderApi.cancelOrder.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: currentProductId,
          reason: cancelReason,
        }),
      });

      const dataResponse = await response.json();

      if (response.ok && dataResponse.success) {
        console.log(dataResponse.message);
        fetchOrderDetails(); // Refresh order list after deletion
      } else {
        console.error(
          "Failed to delete order:",
          dataResponse.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Order delete error:", error);
    }

    setShowModal(false);
    setCancelReason("");
    setCurrentProductId(null);
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {users.length === 0 && (
        <p className="text-center text-gray-500">No users available</p>
      )}

      {users.map((user) => {
        // Filter orders for the current user
        const userOrders = orders.filter((order) => order.userId === user.id);

        return (
          <div key={user.id} className="space-y-6 border p-9 rounded-lg shadow-lg overflow-hidden bg-gray-100">
            {/* User Details */}
            <div className="text-center border-2 rounded-md mb-4 py-1 flex flex-col md:flex-row items-center justify-evenly shadow-lg animated-border">
              <h2 className="w-auto transition-all text-xl font-semibold animate-backgroundAnimation text-white px-4 rounded-2xl shadow-md mb-4 md:mb-0 mx-auto">
                User Details
              </h2>
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row justify-evenly w-full items-center space-y-2 md:space-y-0 md:space-x-4">
                <p className="text-lg font-bold mb-2 md:mb-0">
                  Name: <span className="font-medium">{user.name}</span>
                </p>
                <p className="text-lg font-bold mb-2 md:mb-0">
                  Role: <span className="font-medium">{user.role}</span>
                </p>
                <p className="text-lg font-bold">
                  Email: <span className="font-medium">{user.email}</span>
                </p>
              </div>
            </div>

            {/* User Orders */}
            {userOrders.length === 0 ? (
              <p className="text-center text-gray-500">No orders for this user</p>
            ) : (
              userOrders.map((item) => (
                <div
                  key={item._id}
                  className="space-y-4 bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="relative border rounded-lg bg-gray-50 p-4">
                    <p className="absolute top-1 mb-4 left-3 font-medium text-xs text-gray-400">
                      Created At:{" "}
                      <span className="text-xs text-gray-600">
                        {moment(item.createdAt).format("LLLL")}
                      </span>
                    </p>
                    <div className="lg:flex">
                      <div className="grid gap-4 p-4 lg:w-2/3">
                        {item.productDetails.map((product) => (
                          <div
                            key={product.productId}
                            className="flex gap-4 p-4 bg-white border rounded-md shadow-sm"
                          >
                            <img
                              src={product?.image.replace(/^http:\/\//i, "https://")}
                              alt={product.name}
                              className="w-32 h-24 bg-slate-200 object-scale-down mix-blend-multiply p-2 rounded-md"
                            />
                            <div className="flex flex-col justify-between">
                              <div className="font-medium text-lg text-gray-800 line-clamp-3">
                                {product.name}
                              </div>
                              <div className="flex items-center gap-5 mt-2">
                                <div className="text-lg text-green-600 font-bold">
                                  {displayINRCurrency(product.price)}
                                </div>
                                <div className="text-gray-600">
                                  Quantity: {product.quantity}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 lg:w-1/3 h-fit bg-green-50 space-y-4 relative rounded-lg shadow-sm">
                        {/* Delete button */}
                        <div
                          className="absolute right-2 top-2 p-2 text-2xl text-red-600 rounded-full hover:bg-red-500 hover:text-white cursor-pointer transition-colors duration-300"
                          onClick={() =>
                            handleDeleteClick(item.productDetails[0].productId)
                          }
                        >
                          <MdDelete />
                        </div>
                        <div>
                          <div className="text-lg font-medium text-gray-800 mb-2">
                            Payment Details:
                          </div>
                          <div className="text-gray-600">
                            Payment Method:{" "}
                            {item.paymentDetails.payment_method_type[0]}
                          </div>
                          <div className="text-gray-600">
                            Payment Status: {item.paymentDetails.payment_status}
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-medium text-gray-800 mb-2">
                            Shipping Details
                          </div>
                          {item.shipping_options.map((shipping) => (
                            <div
                              key={shipping.shipping_rate}
                              className="text-gray-600"
                            >
                              Shipping Amount: {shipping.shipping_amount}
                            </div>
                          ))}
                        </div>
                        <div className="float-end text-lg font-extrabold text-gray-700 mt-4">
                          Total Amount: {displayINRCurrency(item.totalAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })}

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Cancel Order</h2>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation"
              className="w-full h-24 p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-300"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllOrders;
