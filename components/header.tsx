// components/header.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CartIcon } from "@/components/cart-icon"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, ShoppingBag, ChevronDown, LayoutDashboard, Menu } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import LinkAndSmileLogo from "@/public/LinkAndSmileLogo.png"

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!mounted) return null
  if (pathname?.startsWith("/admin")) return null

  const navLinks = [
    { href: "/products", label: "Products" },
    { href: "/about-us", label: "About Us" },
    { href: "/contact-us", label: "Contact" },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100"
          : "bg-white border-b border-stone-100"
      }`}
    >
      {/* Thin accent bar at top */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 focus:outline-none group shrink-0"
            aria-label="Go to home"
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-amber-200 group-hover:ring-amber-400 transition-all duration-200">
              <Image
                src={LinkAndSmileLogo}
                alt="LinkAndSmile"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight text-stone-900">
                LinkAndSmile
              </span>
              <span className="text-[10px] text-stone-400 tracking-widest uppercase font-medium">
                India's Marketplace
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  pathname === href
                    ? "bg-amber-50 text-amber-700"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/register-as-seller"
              className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all duration-150"
            >
              Sell with us
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {session?.user && <CartIcon />}

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9 px-2 sm:px-3 hover:bg-stone-50 rounded-xl"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-amber-700" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-stone-700 max-w-[100px] truncate">
                      {session.user.name?.split(" ")[0] || "Account"}
                    </span>
                    <ChevronDown className="h-3 w-3 text-stone-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border border-stone-100 p-1">
                  <div className="px-3 py-2 mb-1">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Account</p>
                    <p className="text-sm font-medium text-stone-800 truncate mt-0.5">
                      {session.user.name || session.user.email}
                    </p>
                  </div>
                  <div className="h-px bg-stone-100 mb-1" />

                  {/* Mobile nav links */}
                  <div className="md:hidden">
                    {navLinks.map(({ href, label }) => (
                      <DropdownMenuItem key={href} asChild>
                        <Link href={href} className="cursor-pointer rounded-lg text-sm">{label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <div className="h-px bg-stone-100 my-1" />
                  </div>

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer rounded-lg text-sm">
                      <User className="h-4 w-4 text-stone-400" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/orders" className="flex items-center gap-2 cursor-pointer rounded-lg text-sm">
                      <ShoppingBag className="h-4 w-4 text-stone-400" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 cursor-pointer rounded-lg text-sm">
                        <LayoutDashboard className="h-4 w-4 text-stone-400" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {session.user.role === "shop_owner" && (
                    <DropdownMenuItem asChild>
                      <Link href="/vendor" className="flex items-center gap-2 cursor-pointer rounded-lg text-sm">
                        <LayoutDashboard className="h-4 w-4 text-stone-400" />
                        Vendor Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <div className="h-px bg-stone-100 my-1" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 cursor-pointer rounded-lg text-sm text-red-500 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* Mobile menu */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                        <Menu className="h-5 w-5 text-stone-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl border border-stone-100 p-1">
                      {navLinks.map(({ href, label }) => (
                        <DropdownMenuItem key={href} asChild>
                          <Link href={href} className="cursor-pointer rounded-lg text-sm">{label}</Link>
                        </DropdownMenuItem>
                      ))}
                      <div className="h-px bg-stone-100 my-1" />
                      <DropdownMenuItem onClick={() => router.push("/auth/login")} className="cursor-pointer rounded-lg text-sm">
                        Sign In
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Desktop sign in */}
                <Button
                  onClick={() => router.push("/auth/login")}
                  size="sm"
                  className="hidden md:flex bg-stone-900 hover:bg-stone-800 text-white rounded-xl h-9 px-4 text-sm font-medium"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}