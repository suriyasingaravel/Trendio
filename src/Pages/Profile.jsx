import React, { useEffect, useState } from "react";
import { Box, Heading, Button, Link } from "@chakra-ui/react";
import axios from "axios";
import { URL } from "./Login";
import { useNavigate } from "react-router-dom";
import ProfileOrders from "../Components/ProfileOrders";
import OrderCard from "../Components/OrderCard";

const Profile = () => {
  const token = localStorage.getItem("token") || "";
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [adminUser, setAdminUser] = useState([]);

  useEffect(() => {
    axios({
      method: "get",
      url: `${URL}/users`,
      params: {
        token: localStorage.getItem("token"),
        admin: true,
      },
    })
      .then((r) => {
        setAdminUser(r.data);
      })
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    if (token) {
      axios({
        method: "get",
        url: `${URL}/users`,
        params: {
          token,
        },
      })
        .then((response) => {
          const userData = response.data[0];
          if (userData) {
            setUserData(userData);
          }
        })
        .catch((error) => console.log(error));

      axios({
        method: "get",
        url: `${URL}/orders`,
        params: {
          usertoken: token,
        },
      })
        .then((response) => {
          setPendingOrders(
            response.data.filter(
              (item) =>
                item.orderStatus === "placed" || item.orderStatus === "shipped"
            )
          );
          setRecentOrders(
            response.data.filter(
              (item) =>
                item.orderStatus === "delivered" ||
                item.orderStatus === "cancelled"
            )
          );
        })
        .catch((error) => console.log(error));
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const cancelOrder = (id) => {
    axios
      .delete(`${URL}/orders/${id}`)
      .then(() => {
        // Refresh the order list after cancellation
        setPendingOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== id)
        );
      })
      .catch((error) => console.log(error));
  };

  return (
    <Box
      maxW={["400px", "600px", "800px"]}
      mx="auto"
      p="4"
      bg="gray.100"
      borderRadius="md"
      boxShadow="md"
     
      mt={10}
      m={["7","auto","auto"]}
      mb={10}
    >
      <Heading as="h1" textAlign="center" mb="4">
        Profile
      </Heading>
      {userData && (
        <Box textAlign="center">
          <p className="welcome-text">Welcome, {userData.f_name}!</p>

          {adminUser.length > 0 ? (
            <Box padding={3}>
              <Link onClick={() => navigate("/admin")}> Admin Dashboard </Link>
            </Box>
          ) : null}

          <Button colorScheme="red" size="md" mt="4" onClick={logout}>
            Logout
          </Button>
        </Box>
      )}
      <h1>My Orders</h1>
      {pendingOrders?.length > 0 &&
        pendingOrders?.map((item) => (
          <OrderCard
            key={item.id}
            productImage={item.productImage} // Ensure you pass the correct prop name
            productName={item.productName} // Ensure you pass the correct prop name
            productPrice={item.productPrice} // Ensure you pass the correct prop name
            quantity={item.quantity} // Ensure you pass the correct prop name
            productId={item.id} // Ensure you pass the correct prop name
            cancelOrder={cancelOrder}
          />
        ))}
      {/* <h1>Recent Orders</h1>
      {recentOrders?.length > 0 &&
        recentOrders?.map((item) => (
          <ProfileOrders
            key={item.id}
            image={item.productImage} // Ensure you pass the correct prop name
            {...item}
          />
        ))} */}
    </Box>
  );
};

export default Profile;
