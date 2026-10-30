import PageView, { pageMetadata } from "@/components/PageView";

export const generateMetadata = () => pageMetadata("home");

export default function Home() {
  return <PageView slug="home" />;
}
