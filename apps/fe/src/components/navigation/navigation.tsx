import { Link, useLocation } from 'react-router-dom'
import { ModeToggle } from '@/components/theme/mode-toggle'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Wallet, Home, Image, UserPlus, Plus } from 'lucide-react'

export default function Navigation() {
  const location = useLocation()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:text-foreground">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              NFT Hub
            </Link>
            
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/"
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive('/') && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/gallery"
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive('/gallery') && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Image className="mr-2 h-4 w-4" />
                      Gallery
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={'mt-[.8rem]'}>
                    <UserPlus className="mr-2 h-4 w-4 " />
                    Actions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            to="/"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              NFT Hub
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Register, mint, and discover unique NFTs on the blockchain
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/register"
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              isActive('/register') && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div className="text-sm font-medium leading-none flex items-center">
                              <UserPlus className="mr-2 h-4 w-4" />
                              Register
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Become a verified NFT creator with a one-time registration fee
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/mint"
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              isActive('/mint') && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div className="text-sm font-medium leading-none flex items-center">
                              <Plus className="mr-2 h-4 w-4" />
                              Mint NFT
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Create and mint your unique NFT from our curated collection
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Not Connected</span>
            </div>
            
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </button>
            
            <ModeToggle />
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden border-t border-border py-4">
          <div className="flex flex-wrap gap-2">
            <Link 
              to="/" 
              className={cn(
                "inline-flex items-center rounded-md px-3 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive('/') && "bg-accent text-accent-foreground"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
            <Link 
              to="/gallery" 
              className={cn(
                "inline-flex items-center rounded-md px-3 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive('/gallery') && "bg-accent text-accent-foreground"
              )}
            >
              <Image className="mr-2 h-4 w-4" />
              Gallery
            </Link>
            <Link 
              to="/register" 
              className={cn(
                "inline-flex items-center rounded-md px-3 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive('/register') && "bg-accent text-accent-foreground"
              )}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Register
            </Link>
            <Link 
              to="/mint" 
              className={cn(
                "inline-flex items-center rounded-md px-3 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive('/mint') && "bg-accent text-accent-foreground"
              )}
            >
              <Plus className="mr-2 h-4 w-4" />
              Mint
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}