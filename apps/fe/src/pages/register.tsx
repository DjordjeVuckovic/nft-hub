import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '@/hooks/useWallet'
import { useNftHubContract } from '@/hooks/useNftHubContract.ts'
import { Button } from '@/components/ui/button'
import { WalletButton } from '@/components/wallet/wallet-button.tsx'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function Register() {
  const { isConnected } = useWallet()
  const { 
    isRegistered, 
    isBlacklisted, 
    registrationFee, 
    isLoadingRegister,
    lastTxHash,
    register 
  } = useNftHubContract()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')


  const handleRegister = async () => {
    setError('')
    setSuccess('')

    setSuccess('Registration transaction submitted! Waiting for confirmation...')
    
    const result = await register()
    
    if (result.success) {
      setSuccess('Registration successful! You can now mint NFTs.')
    } else {
      setError(result.error || 'Registration failed. Please try again.')
    }
  }

  const getStatusMessage = () => {
    if (isBlacklisted) {
      return {
        type: 'error' as const,
        message: 'Your address is blacklisted and cannot register',
        icon: <AlertCircle className="h-5 w-5" />
      }
    }
    
    if (isRegistered) {
      return {
        type: 'success' as const,
        message: 'You are already registered! You can now mint NFTs.',
        icon: <CheckCircle className="h-5 w-5" />
      }
    }
    
    return null
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">Register</h1>
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
                <WalletButton variant="default" className="w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {statusMessage && (
                  <div className={`rounded-lg p-4 border flex items-center gap-3 ${
                    statusMessage.type === 'error' 
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                      : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                  }`}>
                    {statusMessage.icon}
                    <p className="text-sm font-medium">{statusMessage.message}</p>
                  </div>
                )}

                {!isRegistered && !isBlacklisted && (
                  <>
                    <div className="bg-muted rounded-lg p-4 border border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Registration Fee</span>
                        <span className="font-medium">{registrationFee} ETH</span>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        ⚠️ Registration requires a one-time payment to prevent spam and ensure serious creators join the platform.
                      </p>
                    </div>

                    <Button 
                      onClick={handleRegister}
                      disabled={isLoadingRegister || isRegistered || isBlacklisted}
                      className="w-full"
                    >
                      {isLoadingRegister ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        `Register & Pay ${registrationFee} ETH`
                      )}
                    </Button>
                  </>
                )}

                {isRegistered && (
                  <div className="text-center">
                    <Button asChild className="w-full">
                      <Link to="/mint">
                        Go to Mint NFT
                      </Link>
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium">Error</p>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">Success</p>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">{success}</p>
                    {lastTxHash && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 break-all">
                        Transaction: {lastTxHash}
                      </p>
                    )}
                  </div>
                )}

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