// RootNavDemo.tsx — Ví dụ tối giản: HomeStack (Home -> Detail) nằm bên trong Bottom Tab
import React from "react";
import { View, Text, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Khai báo kiểu Params cho Stack Home — TypeScript sẽ báo lỗi nếu quên gửi "id"
type HomeStackParamList = {
  Home: undefined;
  Detail: { id: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator();

function HomeScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Trang chủ</Text>
      <Button
        title="Xem chi tiết SP 001"
        onPress={() => navigation.navigate("Detail", { id: "001" })}
      />
    </View>
  );
}

function DetailScreen({ route }: any) {
  // Nếu quên truyền params ở navigate() phía trên, dòng dưới sẽ crash vì route.params là undefined
  const { id } = route.params;
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Chi tiết sản phẩm: {id}</Text>
    </View>
  );
}

// Stack riêng cho nhánh "Trang chủ" — sẽ được nhồi vào làm 1 Tab bên dưới
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}

function CartScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Giỏ hàng</Text>
    </View>
  );
}

export default function RootNavDemo() {
  return (
    // NavigationContainer PHẢI là component NGOÀI CÙNG, chỉ khai báo DUY NHẤT 1 lần ở gốc App
    <NavigationContainer>
      <Tab.Navigator>
        {/* Tab này KHÔNG chứa trực tiếp HomeScreen, mà chứa cả 1 HomeStack bên trong */}
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{ title: "Trang chủ" }}
        />
        <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: "Giỏ hàng" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}