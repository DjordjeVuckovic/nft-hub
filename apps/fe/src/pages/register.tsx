import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Register() {
  const [isConnected, setIsConnected] = useState(false)
  const [registrationFee] = useState('0.01 ETH')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Register</h1>
            <p className="text-muted-foreground">
              Register to become an NFT creator on the platform
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            {!isConnected ? (
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
                <p className="text-muted-foreground mb-6">
                  You need to connect your wallet to register
                </p>
                <button 
                  onClick={() => setIsConnected(true)}
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4 border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Registration Fee</span>
                    <span className="font-medium">{registrationFee}</span>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    ⚠️ Registration requires a one-time payment to prevent spam and ensure serious creators join the platform.
                  </p>
                </div>

                <button className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Register & Pay {registrationFee}
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  By registering, you agree to our terms and conditions
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link 
              to="/"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}