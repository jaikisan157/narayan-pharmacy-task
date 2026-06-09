"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavHeader() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          Narayan Rx <span>Checker</span>
        </div>
        <nav className="nav-links">
          <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
            New Prescription
          </Link>
          <Link href="/prescriptions" className={`nav-link ${pathname === "/prescriptions" ? "active" : ""}`}>
            Prescription History
          </Link>
        </nav>
      </div>
    </header>
  );
}
