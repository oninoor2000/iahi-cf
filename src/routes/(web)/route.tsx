import Footer from "@/components/sections/footer";
import Header from "@/components/sections/header";
import MembershipPromoBanner from "@/components/sections/membership-promo-banner";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)")({
  component: WebChromeLayout,
});

function WebChromeLayout() {
  return (
    <>
      <Header />
      <MembershipPromoBanner />
      <Outlet />
      <Footer />
    </>
  );
}
