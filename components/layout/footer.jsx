import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, ShoppingCart } from "lucide-react"
import Image from "next/image"

export function Footer() {
  const usefulLinks = [
    { name: "Contact Us", href: "/contact" },
    { name: "Terms and Conditions", href: "/terms" },
  ]

  const makeMoneyLinks = [
    { name: "Become a community member", href: "/join-member" },
  ]

  const socialLinks = [
    { 
      icon: Facebook, 
      href: "https://www.facebook.com/profile.php?id=61573028302471&mibextid=ZbWKwL", 
      label: "Facebook" 
    },
    { 
      icon: Instagram, 
      href: "https://www.instagram.com/pamarelfoodmarket?utm_source=qr&igsh=NWtkOWMxYzFra2Zh", 
      label: "Instagram" 
    },
  ]

  const paymentMethods = ["Flutterwave", "Wallet Transfer"]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12 md:px-6">
        {/* Main Footer Content */}
        <div className="grid gap-8 lg:grid-cols-6 mb-12">
          
          {/* Company Info - 2 columns on large screens */}
          <div className="space-y-6 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-55.png"
                alt="pamarel logo"
                width={100}
                height={100}
                className="object-contain"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your one-stop shop for everything, delivering quality and convenience right to your doorstep.
            </p>
          </div>

          {/* Useful Links */}
          <div className="space-y-4 lg:col-span-1">
            <h4 className="font-semibold text-white text-lg mb-4">LET US HELP YOU</h4>
            <ul className="space-y-3">
              {usefulLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white hover:underline transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Make Money Section */}
          <div className="space-y-4 lg:col-span-1">
            <h4 className="font-semibold text-white text-lg mb-4">MAKE MONEY WITH pamarel</h4>
            <ul className="space-y-3">
              {makeMoneyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white hover:underline transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social - 2 columns on large screens */}
          <div className="space-y-6 lg:col-span-2">
            {/* Newsletter */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white text-lg">NEW TO pamarel?</h4>
              <p className="text-sm text-gray-400">
                Subscribe for exclusive offers and updates.
              </p>
              <form className="flex flex-col sm:flex-row gap-3">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-primary focus:border-primary" 
                  required
                />
                <Button 
                  type="submit" 
                  className="bg-accent text-accent-foreground hover:bg-accent/90 whitespace-nowrap"
                >
                  Subscribe
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white text-lg">JOIN US ON</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    <social.icon className="h-5 w-5 hover:text-primary" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="text-sm text-gray-400 order-2 lg:order-1">
              &copy; {new Date().getFullYear()} pamarel. All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex flex-col sm:flex-row items-center gap-4 order-1 lg:order-2">
              <span className="font-semibold text-sm text-white">Payment Methods:</span>
              <div className="flex flex-wrap gap-3 justify-center">
                {paymentMethods.map((method) => (
                  <span 
                    key={method}
                    className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-md"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}