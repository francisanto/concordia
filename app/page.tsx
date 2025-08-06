"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Lock, Trophy, Target, ArrowRight, Shield, Coins, Wallet, ChevronDown, Plus } from "lucide-react"
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi"
import { opBNBTestnet } from "wagmi/chains"
import { GroupDashboard, type SavingsGroup } from "@/components/group-dashboard"
import { SmartContractIntegration } from "@/components/smart-contract-integration"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SparkleBackground } from "@/components/sparkle-background"
import { AuraRewards } from "@/components/aura-rewards"
import { NFTWalletDisplay } from "@/components/nft-wallet-display"
import { AdminDashboard } from "@/components/admin-dashboard"
import { GroupOptions } from "@/components/group-options"
import { JoinGroupModal } from "@/components/join-group-modal"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Client-side only component to prevent hydration errors
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  return <>{children}</>
}

function WalletConnection({ handleDisconnect }: { handleDisconnect: () => void }) {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, error, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const requiredChainId = opBNBTestnet.id
  const isWrongNetwork = isConnected && chainId !== requiredChainId

  const handleConnect = async () => {
    try {
      console.log("🔗 Attempting to connect wallet...")
      console.log("Available connectors:", connectors.map(c => c.name))

      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && !window.ethereum) {
        alert("MetaMask is not installed. Please install MetaMask extension first.")
        return
      }

      // Try to find MetaMask connector
      const metaMaskConnector = connectors.find((connector) => 
        connector.name === "MetaMask" || connector.name === "Injected" || connector.name === "Browser Wallet"
      )

      if (metaMaskConnector) {
        console.log("✅ Found MetaMask connector:", metaMaskConnector.name)
        const result = await connect({ connector: metaMaskConnector })
        console.log("🔗 Connection result:", result)
      } else {
        console.warn("⚠️ MetaMask connector not found, trying first available connector")
        if (connectors.length > 0) {
          console.log("🔄 Using first available connector:", connectors[0].name)
          const result = await connect({ connector: connectors[0] })
          console.log("🔗 Connection result:", result)
        } else {
          console.error("❌ No connectors available")
          alert("No wallet connectors available. Please install MetaMask.")
        }
      }
    } catch (err) {
      console.error("❌ Failed to connect wallet:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      if (errorMessage.includes("User rejected")) {
        alert("Connection was rejected. Please try again and approve the connection in MetaMask.")
      } else if (errorMessage.includes("already pending")) {
        alert("Connection is already pending. Please check MetaMask for the connection request.")
      } else {
        alert("Failed to connect wallet. Please make sure MetaMask is installed and unlocked.")
      }
    }
  }

  if (isPending) {
    return (
      <Button disabled className="bg-gradient-to-r from-[#F042FF] to-[#7226FF] text-white font-semibold px-6 py-2">
        {"Connecting..."}
      </Button>
    )
  }

  if (isWrongNetwork) {
    return (
      <div className="flex flex-col items-end space-y-2">
        <Button
          onClick={() => switchChain({ chainId: requiredChainId })}
          className="bg-red-500 hover:bg-red-700 text-white font-semibold px-6 py-2"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {"Switch to opBNB Testnet"}
        </Button>
        <p className="text-red-400 text-xs max-w-xs text-right">{"Please switch to opBNB Testnet to continue."}</p>
      </div>
    )
  }

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-concordia-light-purple text-concordia-light-purple hover:bg-concordia-light-purple/10 bg-transparent font-semibold"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {address.slice(0, 6) + "..." + address.slice(-4)}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-concordia-dark-blue border-concordia-light-purple/30">
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(address)}
            className="text-white hover:bg-concordia-light-purple/20 cursor-pointer"
          >
            {"Copy Address"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open("https://testnet.bscscan.com/address/" + address, "_blank")}
            className="text-white hover:bg-concordia-light-purple/20 cursor-pointer"
          >
            {"View on Explorer"}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onSelect={(e) => {
              e.preventDefault();
              handleDisconnect();
            }}
            className="text-red-400 hover:bg-red-400/20 cursor-pointer"
          >
            {"Disconnect"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex flex-col items-end space-y-2">
      <Button
        onClick={handleConnect}
        className="bg-gradient-to-r from-concordia-pink to-concordia-light-purple hover:from-concordia-pink/80 hover:to-concordia-light-purple/80 text-white font-semibold px-6 py-2 shadow-lg"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {"Connect MetaMask"}
      </Button>
      {error && <p className="text-red-400 text-xs max-w-xs text-right">{error.message}</p>}
    </div>
  )
}

export default function HomePage() {
  const [teamName, setTeamName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [contributionAmount, setContributionAmount] = useState("")
  const [duration, setDuration] = useState("")
  const [activeTab, setActiveTab] = useState("home")
  const { isConnected, address } = useAccount()
  const [userGroups, setUserGroups] = useState<SavingsGroup[]>([])
  const [isContributing, setIsContributing] = useState(false)
  const [withdrawalDate, setWithdrawalDate] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [userAuraPoints, setUserAuraPoints] = useState(0)
  const { toast } = useToast()
  const { disconnect } = useDisconnect();
  const [autoRedirectDone, setAutoRedirectDone] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminApiKey, setAdminApiKey] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [joinGroupModalOpen, setJoinGroupModalOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false) // State for create group modal
  const [showJoinModal, setShowJoinModal] = useState(false) // State for join group modal
  const [isJoining, setIsJoining] = useState(false) // State to track if joining process is active


  // Define admin wallet from environment variables or default
  const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase() || "0xdA13e8f82C83d14E7aa639354054B7f914cA0998"

  // Check if current user is admin
  useEffect(() => {
    setIsAdmin(address?.toLowerCase() === ADMIN_WALLET);
  }, [address, ADMIN_WALLET]);

  // Handle wallet disconnection
  const handleDisconnect = () => {
    try {
      console.log("🔌 Attempting to disconnect wallet...");
      disconnect();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wagmi.connected');
        localStorage.removeItem('wagmi.wallet');
        localStorage.removeItem('wagmi.account');
        if (window.ethereum) {
          window.ethereum.removeAllListeners();
        }
      }
      setUserGroups([]);
      setActiveTab("home");
      setAutoRedirectDone(false);
      setIsAdmin(false); // Reset admin status on disconnect
      console.log("✅ Wallet disconnected successfully and redirected to home");
    } catch (error) {
      console.error("❌ Error disconnecting wallet:", error);
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('wagmi.connected');
          localStorage.removeItem('wagmi.wallet');
          localStorage.removeItem('wagmi.account');
        }
        setUserGroups([]);
        setActiveTab("home");
        setAutoRedirectDone(false);
        setIsAdmin(false);
      } catch (e) {
        console.error("❌ Error clearing storage:", e);
      }
    }
  };

  // Load groups from storage when wallet connects
  useEffect(() => {
    const loadGroups = async () => {
      if (!isConnected || !address) {
        console.log("🔌 Wallet not connected, skipping group load");
        setUserGroups([]);
        setIsLoadingGroups(false);
        return;
      }

      setIsLoadingGroups(true);
      try {
        console.log("🔄 Loading groups for wallet:", address);

        // First try localStorage for immediate response
        const { dataPersistenceService } = await import('@/lib/data-persistence');
        const localGroups = await dataPersistenceService.loadGroups();

        // Filter groups where user is creator or member
        const userLocalGroups = localGroups.filter((group: any) => {
          const isCreator = group.createdBy?.toLowerCase() === address.toLowerCase() || 
                           group.creator?.toLowerCase() === address.toLowerCase();
          const isMember = group.members?.some((member: any) => 
            member.address?.toLowerCase() === address.toLowerCase()
          );
          return isCreator || isMember;
        });

        console.log("📊 Local groups found:", userLocalGroups.length);

        // Format and set local groups immediately for better UX
        if (userLocalGroups.length > 0) {
          const formattedLocalGroups: SavingsGroup[] = userLocalGroups.map((group: any) => ({
            id: group.id,
            name: group.name || "Unnamed Group",
            goal: group.description || group.goal || "No description",
            targetAmount: group.targetAmount || 0,
            currentAmount: group.currentAmount || 0,
            contributionAmount: group.contributionAmount || (group.targetAmount || 0) / 10,
            duration: group.duration || "unknown",
            endDate: group.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            members: group.members ? group.members.map((member: any) => ({
              address: member.address,
              nickname: member.nickname || "Member",
              contributed: member.contributed || 0,
              auraPoints: member.auraPoints || 0,
              status: member.status || "active"
            })) : [],
            status: group.status || "active",
            nextContribution: group.nextContribution || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            createdBy: group.createdBy || group.creator || "",
            createdAt: group.createdAt || new Date().toISOString(),
            isActive: group.isActive !== undefined ? group.isActive : true,
          }));

          setUserGroups(formattedLocalGroups);
          console.log("✅ Local groups loaded immediately:", formattedLocalGroups.length);
        }

        // Then try to sync with backend/Greenfield if available
        try {
          const { hybridStorageService } = await import('@/lib/hybrid-storage');
          const remoteGroups = await hybridStorageService.loadGroups(address);
          console.log("📊 Remote groups from Greenfield:", remoteGroups.length);

          if (remoteGroups.length > 0) {
            const formattedRemoteGroups: SavingsGroup[] = remoteGroups.map((group: any) => ({
              id: group.id,
              name: group.name || "Unnamed Group",
              goal: group.description || group.goal || "No description",
              targetAmount: group.targetAmount || 0,
              currentAmount: group.currentAmount || 0,
              contributionAmount: group.contributionAmount || (group.targetAmount || 0) / 10,
              duration: group.duration || "unknown",
              endDate: group.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              members: group.members ? group.members.map((member: any) => ({
                address: member.address,
                nickname: member.nickname || "Member",
                contributed: member.contributed || 0,
                auraPoints: member.auraPoints || 0,
                status: member.status || "active"
              })) : [],
              status: group.status || "active",
              nextContribution: group.nextContribution || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              createdBy: group.createdBy || group.creator || "",
              createdAt: group.createdAt || new Date().toISOString(),
              isActive: group.isActive !== undefined ? group.isActive : true,
            }));

            // Merge with local groups (remote takes priority)
            const mergedGroups = [...formattedRemoteGroups];
            setUserGroups(mergedGroups);
            console.log("✅ Remote groups merged:", mergedGroups.length);

            toast({
              title: "✅ Data Synced",
              description: "Your groups are synced across devices",
              duration: 3000,
            });
          }
        } catch (remoteError) {
          console.log("⚠️ Remote sync failed, using local data:", remoteError);
          // Keep using local groups if remote fails
        }

      } catch (error) {
        console.error("❌ Error loading groups:", error);
        setUserGroups([]);

        toast({
          title: "⚠️ Loading Error", 
          description: "Failed to load groups. Please try refreshing the page.",
          duration: 5000,
        });
      } finally {
        setIsLoadingGroups(false);
      }
    };

    loadGroups();
  }, [isConnected, address, toast]);

  // Save groups using hybrid storage service
  const saveGroup = async (groupData: any) => {
    try {
      console.log("💾 Saving group via hybrid storage service:", groupData);

      if (!address) {
        throw new Error("Wallet not connected");
      }

      // Prepare the group data
      const preparedGroupData = {
        id: groupData.id,
        name: groupData.name,
        description: groupData.description,
        creator: address,
        contributionAmount: groupData.targetAmount,
        currentAmount: groupData.currentAmount,
        targetAmount: groupData.targetAmount,
        goal: groupData.description,
        duration: groupData.duration,
        endDate: groupData.withdrawalDate,
        withdrawalDate: groupData.withdrawalDate,
        isActive: true,
        status: "active",
        createdBy: address,
        members: [
          {
            address: address,
            nickname: "Creator",
            contributed: groupData.currentAmount,
            auraPoints: 10,
            status: "active",
            role: "creator",
            joinedAt: new Date().toISOString()
          }
        ],
        nextContribution: groupData.nextContribution,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Use the hybrid storage service to save the group
      const { hybridStorageService } = await import('@/lib/hybrid-storage');
      const success = await hybridStorageService.saveGroup(preparedGroupData, address);

      if (success) {
        console.log("✅ Group saved to Greenfield successfully");

        // Add the new group to the current list immediately
        const newGroup: SavingsGroup = {
          id: groupData.id,
          name: groupData.name,
          goal: groupData.description,
          targetAmount: groupData.targetAmount,
          currentAmount: groupData.currentAmount,
          contributionAmount: groupData.contributionAmount,
          duration: groupData.duration,
          endDate: groupData.withdrawalDate,
          members: [
            {
              address: address,
              nickname: "Creator",
              contributed: groupData.currentAmount,
              auraPoints: 10,
              status: "active"
            }
          ],
          status: "active",
          nextContribution: groupData.nextContribution,
          createdBy: address,
          createdAt: new Date().toISOString(),
          isActive: true
        };

        setUserGroups(prev => [...prev, newGroup]);
        console.log("✅ Group added to dashboard:", newGroup.id);

        toast({
          title: "✅ Group Created",
          description: "Group saved to BNB Greenfield successfully",
          duration: 3000,
        });
      } else {
        throw new Error("Failed to save to Greenfield");
      }

    } catch (error) {
      console.error("❌ Error saving group to Greenfield:", error);

      toast({
        title: "❌ Save Failed",
        description: "Failed to save group to BNB Greenfield. Please try again.",
        duration: 5000,
      });

      throw error;
    }
  };

  // Load user's groups from Greenfield when wallet connects
  useEffect(() => {
    const loadUserGroups = async () => {
      if (!isConnected || !address) {
        console.log("🔌 Wallet not connected, skipping group load");
        setUserGroups([]);
        setIsLoadingGroups(false);
        return;
      }

      setIsLoadingGroups(true);
      try {
        console.log('📥 Loading user groups from Greenfield...');

        // Fetch groups from API with user address
        const response = await fetch(`/api/groups?address=${address}${isAdmin ? '&admin_key=' + process.env.ADMIN_API_KEY : ''}`)
        const data = await response.json()

        if (data.success && data.groups) {
          // Convert Greenfield data to SavingsGroup format
          const formattedGroups: SavingsGroup[] = data.groups.map((group: any) => ({
            id: group.groupId || group.id,
            name: group.name,
            goal: group.description,
            targetAmount: group.goalAmount || 0,
            currentAmount: group.currentAmount || 0,
            contributionAmount: group.contributionAmount || 0,
            duration: group.duration,
            endDate: group.withdrawalDate || group.endDate,
            members: group.members || [],
            status: group.settings?.isActive ? "active" : "completed",
            nextContribution: group.nextContribution || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            createdBy: group.creator,
            createdAt: group.createdAt,
            isActive: group.settings?.isActive !== false
          }))

          setUserGroups(formattedGroups)
          console.log('✅ User groups loaded:', formattedGroups.length)
        } else {
          console.log('📭 No groups found for user')
          setUserGroups([])
        }
      } catch (error) {
        console.error("❌ Error loading user groups from Greenfield:", error)
        toast.error("Failed to load your groups from blockchain storage")
        setUserGroups([])
      } finally {
        setIsLoadingGroups(false)
      }
    };

    loadUserGroups();
  }, [isConnected, address, isAdmin]); // Re-run if isAdmin status changes

  // Handle group deletion using Greenfield
  const handleDeleteGroup = async (groupId: string) => {
    try {
      console.log('🗑️ Deleting group from Greenfield:', groupId)

      const response = await fetch(`/api/groups/${groupId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // Update user's groups
        setUserGroups(prevGroups => prevGroups.filter(group => group.id !== groupId))
        toast.success("Group deleted successfully from blockchain")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("❌ Error deleting group from Greenfield:", error)
      toast.error("Failed to delete group from blockchain storage")
    }
  }

  // Handle group creation and saving to Greenfield
  const handleGroupCreated = async (newGroup: SavingsGroup) => {
    try {
      console.log('💾 Saving group to Greenfield:', newGroup)

      // Convert to Greenfield format
      const groupData = {
        groupId: newGroup.id,
        name: newGroup.name,
        description: newGroup.goal,
        creator: newGroup.createdBy,
        goalAmount: newGroup.targetAmount,
        currentAmount: newGroup.currentAmount,
        contributionAmount: newGroup.contributionAmount,
        duration: newGroup.duration,
        withdrawalDate: newGroup.endDate,
        members: newGroup.members,
        settings: {
          isActive: true,
          maxMembers: 10,
          dueDay: new Date().getDate(),
        },
        contributions: [],
        blockchain: {
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
          transactionHash: '',
          blockNumber: '',
          gasUsed: '',
          network: 'opBNB Testnet',
        },
        greenfield: {
          objectId: `group_${newGroup.id}`,
          objectName: `groups/group_${newGroup.id}.json`,
          metadataHash: '',
          bucketName: 'concordia-data',
          endpoint: process.env.GREENFIELD_ENDPOINT || '',
        },
      }

      const response = await fetch('/api/groups/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: newGroup.id,
          groupData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Update user's groups and navigate to dashboard
        setUserGroups(prevGroups => [...prevGroups, newGroup])

        // Clear form fields
        setTeamName("")
        setGroupDescription("")
        setContributionAmount("")
        setDuration("")
        setWithdrawalDate("")
        setDueDay("")

        // Force reload groups to ensure data consistency
        setTimeout(async () => {
          try {
            const { hybridStorageService } = await import('@/lib/hybrid-storage');
            const refreshedGroups = await hybridStorageService.loadGroups(address);

            const formattedGroups: SavingsGroup[] = refreshedGroups.map((group: any) => ({
              id: group.id,
              name: group.name || "Unnamed Group",
              goal: group.description || group.goal || "No description",
              targetAmount: group.targetAmount || 0,
              currentAmount: group.currentAmount || 0,
              contributionAmount: group.contributionAmount || 0,
              duration: group.duration,
              endDate: group.endDate || "unknown",
              members: group.members || [],
              status: group.status || "active",
              nextContribution: group.nextContribution || "unknown",
              createdBy: group.createdBy || "unknown",
              createdAt: group.createdAt || new Date().toISOString(),
              isActive: group.isActive !== false,
            }));

            setUserGroups(formattedGroups);
            console.log("✅ Groups refreshed after creation:", formattedGroups.length);
          } catch (error) {
            console.error("⚠️ Failed to refresh groups:", error);
          }
        }, 1000);

        setActiveTab("dashboard")
        toast({
          title: "✅ Group Created",
          description: "Group created and stored on blockchain!",
          duration: 3000,
        });
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("❌ Error saving group to Greenfield:", error)
      toast({
        title: "❌ Creation Failed",
        description: "Failed to save group to blockchain storage",
        duration: 5000,
      });
    }
  }

  // Effect to handle auto-redirect based on connection status and groups
  useEffect(() => {
    if (isConnected && !autoRedirectDone && address) {
      // If currently on the home tab, perform the redirect
        if (activeTab === "home") {
          setTimeout(() => {
            // Check if the user has existing groups
            if (userGroups.length > 0) {
              setActiveTab("dashboard");
              console.log("🔄 Auto-redirecting to dashboard - user has existing groups");

              toast({
                title: "🔗 Wallet Connected",
                description: "Welcome back! Your groups are loaded.",
                duration: 3000,
              });
            } else {
              setActiveTab("options"); // Show group options for new users
              console.log("🔄 Auto-redirecting to group options - new user");

              toast({
                title: "🔗 Wallet Connected",
                description: "Choose to create a new group or join an existing one.",
                duration: 3000,
              });
            }
            setAutoRedirectDone(true); // Mark redirect as done
          }, 1500); // Delay to allow data loading
        }
    }
    // If disconnected, redirect to home and reset flags
    if (!isConnected && activeTab !== "home") {
      setActiveTab("home");
      setAutoRedirectDone(false);
      setIsAdmin(false); // Ensure admin status is reset
      console.log("🔌 Wallet disconnected, redirected to home page");
    }
  }, [isConnected, activeTab, autoRedirectDone, address, userGroups.length]);

  // Effect to handle navigation via custom events
  useEffect(() => {
    const handleNavigateToCreate = () => {
      setActiveTab("create")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleNavigateToOptions = () => {
      setActiveTab("options")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleNavigateToDashboard = () => {
      setActiveTab("dashboard")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    window.addEventListener("navigateToCreate", handleNavigateToCreate)
    window.addEventListener("navigateToOptions", handleNavigateToOptions)
    window.addEventListener("navigateToDashboard", handleNavigateToDashboard)

    return () => {
      window.removeEventListener("navigateToCreate", handleNavigateToCreate)
      window.removeEventListener("navigateToOptions", handleNavigateToOptions)
      window.removeEventListener("navigateToDashboard", handleNavigateToDashboard)
    }
  }, [])

  // Features for the home page
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Group Savings",
      description: "Create savings groups with 2-10 friends for shared goals like trips, concerts, or events.",
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Smart Contract Security",
      description: "Funds are locked in smart contracts and can only be withdrawn when the group agrees.",
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Aura Points System",
      description: "Earn streak rewards for consistent contributions and build trust within your group.",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Milestone Celebrations",
      description: "Unlock fun rewards and celebrations when your group hits savings milestones.",
    },
  ]

  // How it works steps for the home page
  const howItWorks = [
    {
      step: "01",
      title: "Connect Your Wallet",
      description: "Connect MetaMask to get started with secure blockchain savings",
    },
    {
      step: "02",
      title: "Create Your Group",
      description: "Set contribution amount and invite 2-10 friends to join",
    },
    {
      step: "03",
      title: "Lock & Save Together",
      description: "Funds are secured in smart contracts for your chosen duration",
    },
    {
      step: "04",
      title: "Achieve Your Goal",
      description: "Withdraw funds when everyone agrees and celebrate together!",
    },
  ]

  // Scroll to contribution section or connect wallet
  const scrollToContribution = () => {
    if (isConnected) {
      setActiveTab("create")
      // Scroll to top when switching tabs
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      document.getElementById("connect-section")?.scrollIntoView({
        behavior: "smooth",
      })
    }
  }

  // Handle success callback from SmartContractIntegration
  const handleGroupCreatedFromContract = async (groupId: string, txHash: `0x${string}`, contractData: any) => {
    console.log("🎉 Group created successfully via contract! Navigating to dashboard...")

    const parsedContributionAmount = Number.parseFloat(contributionAmount)

    // Calculate end date from withdrawal date or duration
    const endDate =
      withdrawalDate ||
      new Date(
        Date.now() +
          (duration === "1-month" ? 30 : duration === "3-months" ? 90 : duration === "6-months" ? 180 : 365) *
            24 *
            60 *
            60 *
            1000,
      )
        .toISOString()
        .split("T")[0]

    // Calculate next contribution date based on due day
    const nextContributionDate = dueDay
      ? new Date(new Date().getMonth() + 1, Number.parseInt(dueDay))
          .toISOString()
          .split("T")[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const newGroup: SavingsGroup = {
      id: groupId, // Use groupId from contract creation
      name: teamName || "Unnamed Group",
      description: groupDescription || "No description provided.",
      creator: address || "",
      contributionAmount: parsedContributionAmount,
      currentAmount: parsedContributionAmount, // Initial amount in contract
      targetAmount: parsedContributionAmount * 10, // Assuming 10 members for target
      goal: groupDescription || "No description provided.",
      duration: duration,
      endDate: endDate,
      withdrawalDate: contractData.withdrawalDate, // From contract
      dueDay: dueDay,
      isActive: true,
      status: "active",
      createdBy: address || "",
      members: [
        {
          address: address || "0xYourAddress",
          nickname: "You",
          contributed: parsedContributionAmount,
          auraPoints: 10,
          status: "active",
        },
      ],
      nextContribution: nextContributionDate,
      greenfieldObjectId: contractData.greenfieldObjectId, // From contract
      greenfieldMetadataHash: contractData.greenfieldMetadataHash, // From contract
      txHash: txHash, // Pass transaction hash
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      // Save to Greenfield after successful contract creation
      await saveGroup(newGroup);

      // Show success toast with more details
      toast({
        title: "🎉 Payment Confirmed & Group Created!",
        description: `"${newGroup.name}" is now live on BNB Greenfield. Your data is permanently stored and accessible anytime.`,
        duration: 6000,
      })

      // Navigate to dashboard immediately
      setActiveTab("dashboard");

      // Scroll to top of dashboard
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);

    } catch (error) {
      console.error("❌ Error in group creation flow:", error);
      toast({
        title: "⚠️ Group Created but Storage Failed",
        description: "Group was created on blockchain but there was an issue saving to BNB Greenfield. Please refresh the page.",
        duration: 8000,
      });

      // Still navigate to dashboard even if Greenfield save fails
      setActiveTab("dashboard");
    }
  }

  // Handle joining a group via invite code
  const joinGroupByInviteCode = async (inviteCode: string) => {
    if (!isConnected || !address) {
      toast({
        title: "❌ Wallet Not Connected",
        description: "Please connect your wallet to join a group",
        duration: 3000,
      });
      return;
    }

    if (!inviteCode) {
      toast({
        title: "❌ Invite Code Required",
        description: "Please enter a valid invite code",
        duration: 3000,
      });
      return;
    }

    setIsJoining(true) // Set joining state

    try {
      const response = await fetch(`/api/groups/join?invite_code=${inviteCode}&address=${address}`);
      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "✅ Group Joined",
          description: `You've successfully joined ${data.group.name}`,
          duration: 3000,
        });

        // Refresh groups to include the newly joined group
        setTimeout(async () => {
          try {
            const { hybridStorageService } = await import('@/lib/hybrid-storage');
            const allGroups = await hybridStorageService.loadGroups(address);

            const formattedGroups: SavingsGroup[] = allGroups.map((group: any) => ({
              id: group.id,
              name: group.name || "Unnamed Group",
              goal: group.description || group.goal || "No description",
              targetAmount: group.targetAmount || 0,
              currentAmount: group.currentAmount || 0,
              contributionAmount: group.contributionAmount || 0,
              duration: group.duration,
              endDate: group.endDate || "unknown",
              members: group.members || [],
              status: group.status || "active",
              nextContribution: group.nextContribution || "unknown",
              createdBy: group.createdBy || "unknown",
              createdAt: group.createdAt || new Date().toISOString(),
              isActive: group.isActive !== false,
            }));

            setUserGroups(formattedGroups);
            console.log("✅ Groups refreshed after joining:", formattedGroups.length);
          } catch (error) {
            console.error("⚠️ Failed to refresh groups after joining:", error);
          } finally {
            setIsJoining(false) // Reset joining state
          }
        }, 1000);

        setActiveTab("dashboard");
      } else {
        toast({
          title: "❌ Failed to Join Group",
          description: data.error || "Invalid invite code or you're already a member",
          duration: 5000,
        });
        setIsJoining(false) // Reset joining state on error
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "❌ Error",
        description: "Could not join the group. Please try again.",
        duration: 5000,
      });
      setIsJoining(false) // Reset joining state on error
    }
  }

  // Calculate Aura Points based on user's contributions (simplified mechanism)
  useEffect(() => {
    if (isConnected && address && userGroups.length > 0) {
      let totalAuraPoints = 0

      userGroups.forEach(group => {
        // Find user's contribution in this group
        const userMember = group.members.find(member => 
          member.address.toLowerCase() === address.toLowerCase()
        )

        if (userMember) {
          // Each payment gets 10 Aura Points
          const payments = Math.floor(userMember.contributed / group.contributionAmount)
          totalAuraPoints += payments * 10

          // Early payments (first 3 members) get 5 extra points
          if (group.members.indexOf(userMember) < 3) {
            totalAuraPoints += 5
          }
        }
      })

      setUserAuraPoints(totalAuraPoints)
      console.log("💫 Calculated Aura Points:", totalAuraPoints)
    }
  }, [isConnected, address, userGroups])

  // Function to verify admin access
  const verifyAdminAccess = async () => {
    if (!adminApiKey) {
      toast({
        title: "❌ API Key Required",
        description: "Please enter an admin API key",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use the actual admin API key from environment if available, otherwise placeholder
      const apiKeyToUse = process.env.ADMIN_API_KEY || adminApiKey; 
      const response = await fetch(`/api/admin/groups?admin_key=${apiKeyToUse}`);

      if (response.ok) {
        setIsAdmin(true);
        toast({
          title: "✅ Admin Access Granted",
          description: "You now have access to all group data",
        });
      } else {
        toast({
          title: "❌ Access Denied",
          description: "Invalid admin API key",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error verifying admin access:", error);
      toast({
        title: "❌ Verification Error",
        description: "Could not verify admin access",
        variant: "destructive"
      });
    }
  }

  // Placeholder for the contribution handler which needs to be implemented
  const handleContribution = async (groupId: string, amount: number) => {
    console.log(`Attempting to contribute ${amount} BNB to group ${groupId}`);
    // This function needs to be implemented to handle the actual contribution logic,
    // potentially involving interacting with the smart contract.
    toast({
      title: "Contribution Pending",
      description: "Contribution logic needs to be implemented.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-concordia-dark-blue relative">
      <SparkleBackground /> {/* Add the sparkle background here */}
      {/* Navigation */}
      <nav className="border-b border-concordia-light-purple/20 bg-concordia-dark-blue/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* New Logo */}
            <div className="relative">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10"
              >
                <defs>
                  <linearGradient id="logoGradientNew" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F042FF" />
                    <stop offset="100%" stopColor="#7226FF" />
                  </linearGradient>
                  <filter id="glowNew">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Main "C" shape - abstract and interconnected */}
                <path
                  d="M20 2C11.1634 2 4 9.16344 4 18C4 26.8366 11.1634 34 20 34C28.8366 34 36 26.8366 36 18C36 9.16344 28.8366 2 20 2ZM20 6C26.6274 6 32 11.3726 32 18C32 24.6274 26.6274 30 20 30C13.3726 30 8 24.6274 8 18C8 11.3726 13.3726 6 20 6Z"
                  fill="url(#logoGradientNew)"
                  opacity="0.1"
                />
                <path
                  d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30C25.5228 30 30 25.5228 30 20C30 14.4772 25.5228 10 20 10ZM20 14C23.3137 14 26 16.6863 26 20C26 23.3137 23.3137 26 20 26C16.6863 26 14 23.3137 14 20C14 16.6863 16.6863 14 20 14Z"
                  fill="url(#logoGradientNew)"
                  opacity="0.2"
                />
                {/* Interlocking elements */}
                <path
                  d="M20 10 L20 14 M20 26 L20 30 M10 20 L14 20 M26 20 L30 20"
                  stroke="url(#logoGradientNew)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                <circle cx="20" cy="20" r="4" fill="url(#logoGradientNew)" filter="url(#glowNew)" />
                <circle cx="20" cy="20" r="2" fill="white" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-concordia-pink/30 to-concordia-light-purple/30 rounded-lg blur-md -z-10"></div>
            </div>
            <span className="text-white font-orbitron font-bold text-2xl tracking-wider uppercase">CONCORDIA</span>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => setActiveTab("home")}
              className={
                "font-medium transition-colors " +
                (activeTab === "home" ? "text-concordia-pink" : "text-white/80 hover:text-concordia-pink")
              }
            >
              {"Home"}
            </button>
            <ClientOnly>
              {/* Only show dashboard and create group after user has made a choice */}
              {(userGroups.length > 0 || activeTab === "dashboard" || activeTab === "create") && (
                <>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={
                      "font-medium transition-colors " +
                      (activeTab === "dashboard" ? "text-concordia-pink" : "text-white/80 hover:text-concordia-pink")
                    }
                    disabled={!isConnected}
                    style={!isConnected ? { opacity: 0.5, pointerEvents: "none" } : {}}
                  >
                    {"Dashboard"}
                  </button>
                  <button
                    onClick={() => setActiveTab("create")}
                    className={
                      "font-medium transition-colors " +
                      (activeTab === "create" ? "text-concordia-pink" : "text-white/80 hover:text-concordia-pink")
                    }
                    disabled={!isConnected}
                    style={!isConnected ? { opacity: 0.5, pointerEvents: "none" } : {}}
                  >
                    {"Create Group"}
                  </button>
                </>
              )}
              <button
                onClick={() => setActiveTab("aura")}
                className={
                  "font-medium transition-colors " +
                  (activeTab === "aura" ? "text-concordia-pink" : "text-white/80 hover:text-concordia-pink")
                }
                disabled={!isConnected}
                style={!isConnected ? { opacity: 0.5, pointerEvents: "none" } : {}}
              >
                {"Aura Rewards"}
              </button>
              <button
                onClick={() => setActiveTab("nfts")}
                className={
                  "font-medium transition-colors " +
                  (activeTab === "nfts" ? "text-concordia-pink" : "text-white/80 hover:text-concordia-pink")
                }
                disabled={!isConnected}
                style={!isConnected ? { opacity: 0.5, pointerEvents: "none" } : {}}
              >
                {"My NFTs"}
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={
                  "font-medium transition-colors " +
                  (activeTab === "admin" ? "text-concordia-pink" : "text-white/80 hover:text-concordia-pink")
                }
                disabled={!isConnected}
                style={!isConnected ? { opacity: 0.5, pointerEvents: "none" } : {}}
              >
                {"Admin"}
              </button>
            </ClientOnly>
          </div>

          <div className="flex items-center space-x-4">
            <WalletConnection handleDisconnect={handleDisconnect} />
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="options">
            <ClientOnly>
              <GroupOptions 
                onCreateGroup={() => setActiveTab("create")}
                onJoinGroup={() => setJoinGroupModalOpen(true)}
              />
            </ClientOnly>
          </TabsContent>

          <TabsContent value="home" className="space-y-20">
            {/* Hero Section */}
            <section className="text-center py-12">
              <div className="max-w-4xl mx-auto">
                <Badge className="mb-6 bg-concordia-light-purple/20 text-concordia-pink border-concordia-pink/30 font-semibold">
                  {"Built on opBNB • Low Fees • Fast Transactions"}
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  {"Save Money"}
                  <span className="bg-gradient-to-r from-concordia-pink to-concordia-light-purple bg-clip-text text-transparent">
                    {" Together"}
                  </span>
                </h1>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {
                    "Concordia helps small groups of friends save money together for shared goals. Lock funds in smart contracts, earn Aura Points for consistency, and achieve your dreams collectively."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={scrollToContribution}
                    className="bg-gradient-to-r from-concordia-pink to-concordia-light-purple hover:from-concordia-pink/80 hover:to-concordia-light-purple/80 text-white px-8 py-6 text-lg font-semibold"
                  >
                    {isConnected ? "Start Saving Together" : "Connect & Get Started"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <ClientOnly>
                    {isConnected && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setActiveTab("dashboard")}
                        className="border-concordia-light-purple text-concordia-light-purple hover:bg-concordia-light-purple/10 px-8 py-6 text-lg bg-transparent font-semibold"
                      >
                        {"View Dashboard"}
                      </Button>
                    )}
                  </ClientOnly>
                </div>
              </div>
            </section>

            {/* Connect Wallet CTA Section */}
            <ClientOnly>
              {!isConnected && (
                <section id="connect-section" className="py-16">
                  <Card className="max-w-2xl mx-auto bg-gradient-to-r from-concordia-pink/10 to-concordia-light-purple/10 border-concordia-pink/30 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <Wallet className="h-16 w-16 text-concordia-pink mx-auto mb-6" />
                      <h3 className="text-white text-2xl font-bold mb-4">{"Connect Your MetaMask Wallet"}</h3>
                      <p className="text-white/80 mb-6 text-lg">
                        {
                          "Connect your MetaMask wallet to start creating savings groups and managing your funds securely on the blockchain."
                        }
                      </p>
                      <WalletConnection handleDisconnect={handleDisconnect} />
                      <div className="mt-4 text-sm text-white/60">{"Make sure you're connected to opBNB Testnet"}</div>
                    </CardContent>
                  </Card>
                </section>
              )}
            </ClientOnly>

            {/* Stats Section */}
            <section className="py-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold text-concordia-pink mb-2">{"2-10"}</div>
                  <div className="text-white/80 font-medium">{"Friends per Group"}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-concordia-light-purple mb-2">{"100%"}</div>
                  <div className="text-white/80 font-medium">{"Secure & Transparent"}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-concordia-pink mb-2">{"0.001"}</div>
                  <div className="text-white/80 font-medium">{"BNB Transaction Fees"}</div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  {"Why Choose "}
                  <span className="text-concordia-pink">{"CONCORDIA"}</span>?
                </h2>
                <p className="text-white/80 text-lg max-w-2xl mx-auto">
                  {"Built for friends who want to save together without the hassle of traditional methods"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className="bg-concordia-purple/20 border-concordia-light-purple/30 hover:border-concordia-pink/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-concordia-pink/20 to-concordia-light-purple/20 rounded-lg w-fit text-concordia-pink">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-white text-lg font-semibold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/70 text-center">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* How It Works */}
            <section className="py-20">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">{"How It Works"}</h2>
                <p className="text-white/80 text-lg">{"Simple steps to start saving with your friends"}</p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {howItWorks.map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="mb-6">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-concordia-pink to-concordia-light-purple rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {step.step}
                        </div>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-3">{step.title}</h3>
                      <p className="text-white/70">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="dashboard">
            <ClientOnly>
              <div className="mb-4 p-4 bg-concordia-purple/30 border border-concordia-light-purple/30 rounded-lg">
                <p className="text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-concordia-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Your groups are securely stored on the blockchain and can be accessed from any device by connecting the same wallet.
                </p>
              </div>

              {/* Join Group by Invite Code */}
              <div className="mb-6">
                <Card className="bg-concordia-dark-blue/80 border-concordia-light-purple/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white text-xl flex items-center">
                      <Users className="h-5 w-5 text-concordia-pink mr-2" />
                      Join Existing Group
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Enter an invite code to join a friend's savings group
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Enter invite code (e.g. ABC123)" 
                        className="bg-concordia-purple/20 border-concordia-light-purple/30 text-white"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                      />
                      <Button 
                        onClick={() => joinGroupByInviteCode(inviteCode)}
                        className="bg-concordia-pink hover:bg-concordia-pink/80"
                        disabled={!inviteCode || isJoining}
                      >
                        {isJoining ? "Joining..." : "Join Group"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <GroupDashboard
                groups={userGroups}
                onDeleteGroup={handleDeleteGroup}
                onContribute={handleContribution}
                isContributing={isContributing}
                setUserGroups={setUserGroups}
                isConnected={isConnected}
                address={address}
              />
              {isLoadingGroups && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-2 text-white">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-concordia-pink"></div>
                    <span>Loading your groups from BNB Greenfield...</span>
                  </div>
                </div>
              )}
            </ClientOnly>
          </TabsContent>

          <TabsContent value="create">
            {/* Group Contribution Section */}
            <section id="contribution-section" className="py-20">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    {"Create Your "}
                    <span className="text-concordia-pink">{"Savings Group"}</span>
                  </h2>
                  <p className="text-white/80 text-lg">
                    {"Set your contribution amount and duration to start saving with friends"}
                  </p>
                  <div className="mt-4 p-4 bg-concordia-purple/30 border border-concordia-light-purple/30 rounded-lg">
                    <p className="text-white flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-concordia-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Your groups are securely stored on the blockchain and can be accessed from any device by connecting the same wallet.
                    </p>
                  </div>
                </div>

                <Card className="bg-concordia-dark-blue/80 border-concordia-light-purple/30 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <CardTitle className="text-white text-2xl flex items-center justify-center">
                      <Coins className="h-6 w-6 text-concordia-pink mr-2" />
                      {"Group Configuration"}
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      {"Configure your group savings parameters"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="teamName" className="text-white font-semibold">
                        {"Team Name"}
                      </Label>
                      <Input
                        id="teamName"
                        type="text"
                        placeholder="My Awesome Savings Team"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="bg-concordia-dark-blue border-concordia-light-purple/50 text-white placeholder:text-white/50 focus:border-concordia-pink focus:ring-concordia-pink/20"
                      />
                      <p className="text-sm text-white/60">{"A memorable name for your savings group"}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="groupDescription" className="text-white font-semibold">
                        {"Group Goal/Description"}
                      </Label>
                      <Input
                        id="groupDescription"
                        type="text"
                        placeholder="Saving for a trip to Bali!"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        className="bg-concordia-dark-blue border-concordia-light-purple/50 text-white placeholder:text-white/50 focus:border-concordia-pink focus:ring-concordia-pink/20"
                      />
                      <p className="text-sm text-white/60">{"What are you saving for?"}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contribution" className="text-white font-semibold">
                        {"Contribution Amount (BNB)"}
                      </Label>
                      <Input
                        id="contribution"
                        type="number"
                        placeholder="0.1"
                        step="0.01"
                        min="0"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        className="bg-concordia-dark-blue border-concordia-light-purple/50 text-white placeholder:text-white/50 focus:border-concordia-pink focus:ring-concordia-pink/20"
                      />
                      <p className="text-sm text-white/60">{"Amount each member contributes per period"}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-white font-semibold">
                        {"Savings Duration"}
                      </Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="bg-concordia-dark-blue border-concordia-light-purple/50 text-white focus:border-concordia-pink focus:ring-concordia-pink/20">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent className="bg-concordia-dark-blue border-concordia-light-purple/50">
                          <SelectItem value="1-month" className="text-white hover:bg-concordia-light-purple/20">
                            {"1 Month"}
                          </SelectItem>
                          <SelectItem value="3-months" className="text-white hover:bg-concordia-light-purple/20">
                            {"3 Months"}
                          </SelectItem>
                          <SelectItem value="6-months" className="text-white hover:bg-concordia-light-purple/20">
                            {"6 Months"}
                          </SelectItem>
                          <SelectItem value="12-months" className="text-white hover:bg-concordia-light-purple/20">
                            {"12 Months"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-white/60">{"How long funds will be locked in the smart contract"}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="withdrawalDate" className="text-white font-semibold">
                        {"Final Withdrawal Date (Optional)"}
                      </Label>
                      <Input
                        id="withdrawalDate"
                        type="date"
                        value={withdrawalDate}
                        onChange={(e) => setWithdrawalDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="bg-concordia-dark-blue border-concordia-light-purple/50 text-white focus:border-concordia-pink focus:ring-concordia-pink/20"
                      />
                      <p className="text-sm text-white/60">
                        {"Specific date when funds can be withdrawn (overrides duration)"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDay" className="text-white font-semibold">
                        {"Monthly Due Day"}
                      </Label>
                      <Select value={dueDay} onValueChange={setDueDay}>
                        <SelectTrigger className="bg-concordia-dark-blue border-concordia-light-purple/50 text-white focus:border-concordia-pink focus:ring-concordia-pink/20">
                          <SelectValue placeholder="Select day of month" />
                        </SelectTrigger>
                        <SelectContent className="bg-concordia-dark-blue border-concordia-light-purple/50">
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem
                              key={day}
                              value={day.toString()}
                              className="text-white hover:bg-concordia-light-purple/20"
                            >
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-white/60">{"Which day of each month contributions are due"}</p>
                    </div>

                    <div className="bg-concordia-light-purple/10 rounded-lg p-4 border border-concordia-light-purple/20">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-concordia-pink mt-0.5" />
                        <div>
                          <h4 className="text-white font-semibold text-sm">{"Withdrawal Policy"}</h4>
                          <p className="text-white/70 text-sm">
                            {
                              "Funds will be locked in a smart contract. Withdrawal requires agreement from all group members (implemented via smart contract logic, e.g., multi-sig or voting)."
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <SmartContractIntegration
                      teamName={teamName}
                      groupDescription={groupDescription}
                      contributionAmount={contributionAmount}
                      duration={duration}
                      withdrawalDate={withdrawalDate}
                      dueDay={dueDay}
                      onSuccess={handleGroupCreatedFromContract} // Use the contract success handler
                      // Provide a dummy onDeleteSuccess or handle it if the contract handles deletion
                      onDeleteSuccess={(groupId, txHash) => console.log("Contract deletion handled elsewhere")} 
                    />
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="aura">
            <ClientOnly>
              <AuraRewards 
                userAuraPoints={userAuraPoints}
                onAuraPointsUpdate={setUserAuraPoints}
                onBackToDashboard={() => setActiveTab("dashboard")}
              />
            </ClientOnly>
          </TabsContent>

          <TabsContent value="nfts">
            <ClientOnly>
              <NFTWalletDisplay />
            </ClientOnly>
          </TabsContent>

          <TabsContent value="admin">
            <ClientOnly>
              <div className="py-8">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                  <Shield className="mr-2 h-6 w-6 text-concordia-pink" />
                  Admin Dashboard
                </h2>

                {/* Admin Access Input */}
                <div className="mb-6">
                  <Card className="bg-concordia-purple/20 border-concordia-light-purple/30">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">Admin Access</h3>
                          <p className="text-white/70">
                            Enter your admin API key to access all group data stored in BNB Greenfield
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="password" // Use password type for API key
                            placeholder="Enter admin API key"
                            value={adminApiKey}
                            onChange={(e) => setAdminApiKey(e.target.value)}
                            className="bg-concordia-dark-blue border-concordia-light-purple/50 text-white w-64"
                          />
                          <Button
                            onClick={() => verifyAdminAccess()}
                            className="bg-concordia-pink hover:bg-concordia-pink/80"
                            disabled={!adminApiKey} // Disable if no key entered
                          >
                            Verify
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Admin Dashboard Component - Rendered only if isAdmin is true */}
                {isAdmin ? (
                  <AdminDashboard adminApiKey={adminApiKey} />
                ) : (
                  <Card className="bg-concordia-dark-blue/80 border-concordia-light-purple/30 backdrop-blur-sm p-6 text-center">
                    <CardContent>
                      <Shield className="h-12 w-12 text-concordia-pink mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Admin Access Required</h3>
                      <p className="text-white/70">
                        Please enter a valid admin API key and verify to access the admin dashboard.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ClientOnly>
          </TabsContent>
        </Tabs>
      </div>
      {/* Footer */}
      <footer className="border-t border-concordia-light-purple/20 bg-concordia-purple/10 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10"
                  >
                    <defs>
                      <linearGradient id="footerLogoGradientNew" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F042FF" />
                        <stop offset="100%" stopColor="#7226FF" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M16 1C8.26801 1 2 7.26801 2 15C2 22.732 8.26801 29 16 29C23.732 29 30 22.732 30 15C30 7.26801 23.732 1 16 1ZM16 4C21.5228 4 26 8.47715 26 15C26 21.5228 21.5228 26 16 26C10.4772 26 6 21.5228 6 15C6 8.47715 10.4772 4 16 4Z"
                      fill="url(#footerLogoGradientNew)"
                      opacity="0.1"
                    />
                    <path
                      d="M16 8C12.6863 8 10 10.6863 10 14C10 17.3137 12.6863 20 16 20C19.3137 20 22 17.3137 22 14C22 10.6863 19.3137 8 16 8ZM16 11C17.6569 11 19 12.3431 19 14C19 15.6569 17.6569 17 16 17C14.3431 17 13 15.6569 13 14C13 12.3431 14.3431 11 16 11Z"
                      fill="url(#footerLogoGradientNew)"
                      opacity="0.2"
                    />
                    <path
                      d="M16 8 L16 11 M16 17 L16 20 M8 14 L11 14 M21 14 L24 14"
                      stroke="url(#footerLogoGradientNew)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                    <circle cx="16" cy="14" r="2" fill="url(#footerLogoGradientNew)" />
                    <circle cx="16" cy="14" r="1" fill="white" />
                  </svg>
                </div>
                <span className="text-white font-orbitron font-bold text-xl tracking-wider uppercase">CONCORDIA</span>
              </div>
              <p className="text-white/70">
                {"Empowering friends to save money together through blockchain technology."}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{"Product"}</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("home")}
                  className="block text-white/70 hover:text-concordia-pink transition-colors"
                >
                  {"Features"}
                </button>
                <button
                  onClick={() => setActiveTab("create")}
                  className="block text-white/70 hover:text-concordia-pink transition-colors"
                >
                  {"Create Group"}
                </button>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="block text-white/70 hover:text-concordia-pink transition-colors"
                >
                  {"Dashboard"}
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{"Resources"}</h4>
              <div className="space-y-2">
                <a href="#" className="block text-white/70 hover:text-concordia-pink transition-colors">
                  {"Documentation"}
                </a>
                <a href="#" className="block text-white/70 hover:text-concordia-pink transition-colors">
                  {"Smart Contracts"}
                </a>
                <a href="#" className="block text-white/70 hover:text-concordia-pink transition-colors">
                  {"Security"}
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-concordia-light-purple/20 mt-8 pt-8 text-center">
            <p className="text-white/70">{"© 2024 CONCORDIA. Built on opBNB. All rights reserved."}</p>
          </div>
        </div>
      </footer>

      {/* Toast notifications */}
      <Toaster />

      {/* Join Group Modal */}
      <JoinGroupModal
        isOpen={joinGroupModalOpen}
        onClose={() => setJoinGroupModalOpen(false)}
        onJoinSuccess={(groupId, groupName) => {
          console.log(`Successfully joined group: ${groupName} (${groupId})`)
          // Refresh the page to reload groups
          window.location.reload()
        }}
      />
    </div>
  )
}