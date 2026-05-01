import LoginPage from "./LoginPage";

export const metadata = {
  title: "Login | Anne Creations",
  description:
    "Login to your Anne Creations account to access embroidery designs, download patterns, and manage your profile easily.",
  keywords: [
    "Anne Creations",
    "login",
    "embroidery designs",
    "customer account",
    "embroidery patterns",
    "Anne Creations login",
  ],
  openGraph: {
    title: "Login | Anne Creations",
    description:
      "Access your Anne Creations account and explore creative embroidery designs and digital downloads.",
    url: "https://www.annecreationshb.com/Login",
    siteName: "Anne Creations",
    images: [
      {
        url: "https://www.annecreationshb.com/images/logo.png",
        width: 800,
        height: 600,
        alt: "Anne Creations Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | Anne Creations",
    description:
      "Sign in to your Anne Creations account to access embroidery design collections and downloads.",
    images: ["https://www.annecreationshb.com/images/logo.png"],
  },
  alternates: {
    canonical: "https://www.annecreationshb.com/Login",
  },
};
export default function Page() {
  return <LoginPage />
}

