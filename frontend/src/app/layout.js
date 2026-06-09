import "./globals.css";
import NavHeader from "./components/NavHeader";

export const metadata = {
  title: "Narayan Pharmacy - Prescription Entry & Drug Interaction Checker",
  description: "Advanced clinical pharmacist workstation for drug-drug interaction validation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavHeader />
        <main className="app-container">
          {children}
        </main>
      </body>
    </html>
  );
}
