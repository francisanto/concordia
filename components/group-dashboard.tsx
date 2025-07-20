"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Target, Plus, Copy, Trash2, Calendar, Crown, Users } from "lucide-react"
import { useAccount } from "wagmi"
import { GroupDetailsModal } from "./group-details-modal"
import { InviteMemberModal } from "./invite-member-modal"
import { JoinGroupModal } from "./join-group-modal"
import { ContributionModal } from "./contribution-modal"
import { DueDateManager } from "./due-date-manager"
import { useGroupRole } from "./iam-access-control"

interface GroupMember {
  address: string
  nickname: string
  contributed: number
  auraPoints: number
  status: "active" | "pending" | "missed"
}

export interface SavingsGroup {
  id: string
  name: string
  goal: string
  targetAmount: number
  currentAmount: number
  contributionAmount: number
  duration: string
  endDate: string
  members: GroupMember[]
  status: "active" | "completed" | "pending"
  nextContribution: string
  createdBy: string // Address of the group creator
  createdAt?: string
}

interface GroupDashboardProps {
  groups: SavingsGroup[]
  onDeleteGroup: (groupId: string) => void
  onContribute?: (groupId: string, amount: number) => void
  isContributing?: boolean
  setUserGroups: React.Dispatch<React.SetStateAction<SavingsGroup[]>>
}

export function GroupDashboard({
  groups,
  onDeleteGroup,
  onContribute,
  isContributing,
  setUserGroups,
}: GroupDashboardProps) {
  const { address } = useAccount()
  const [selectedGroup, setSelectedGroup] = useState<SavingsGroup | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [selectedGroupForInvite, setSelectedGroupForInvite] = useState<SavingsGroup | null>(null)
  const [contributionModalOpen, setContributionModalOpen] = useState(false)
  const [selectedGroupForContribution, setSelectedGroupForContribution] = useState<SavingsGroup | null>(null)
  const [dueDateModalOpen, setDueDateModalOpen] = useState(false)
  const [selectedGroupForDueDate, setSelectedGroupForDueDate] = useState<SavingsGroup | null>(null)
  const [joinGroupModalOpen, setJoinGroupModalOpen] = useState(false)

  const groupRoles = groups.map((group) => useGroupRole(group.id, groups))

  const handleContribute = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    if (group) {
      setSelectedGroupForContribution(group)
      setContributionModalOpen(true)
    }
  }

  const handleContributionSuccess = (groupId: string, amount: number, txHash: `0x${string}`, auraPoints: number) => {
    // Update the group's current amount, next contribution date, and member's aura points
    setUserGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              currentAmount: group.currentAmount + amount,
              nextContribution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              members: group.members.map((member) =>
                member.address === address
                  ? {
                      ...member,
                      contributed: member.contributed + amount,
                      auraPoints: member.auraPoints + auraPoints,
                      status: "active" as const,
                    }
                  : member,
              ),
            }
          : group,
      ),
    )

    const isEarly = new Date() < new Date(groups.find((g) => g.id === groupId)?.nextContribution || "")
    alert(
      `Successfully contributed ${amount} BNB! Earned ${auraPoints} Aura Points${isEarly ? " with early bonus! 🎉" : ""}`,
    )
  }

  const handleDueDateUpdate = (groupId: string, newDueDay: number) => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(newDueDay)

    setUserGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              nextContribution: nextMonth.toISOString().split("T")[0],
            }
          : group,
      ),
    )
    alert(
      `Due date updated to the ${newDueDay}${newDueDay === 1 ? "st" : newDueDay === 2 ? "nd" : newDueDay === 3 ? "rd" : "th"} of each month`,
    )
  }

  const handleInviteFriend = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    if (group) {
      setSelectedGroupForInvite(group)
      setInviteModalOpen(true)
    }
  }

  const handleInviteSent = (address: string, nickname: string) => {
    console.log(`Invite sent to ${address} (${nickname}) for group ${selectedGroupForInvite?.id}`)
    alert(`Invitation sent to ${nickname} (${address})`)
  }

  const handleDeleteClick = (groupId: string) => {
    if (confirm("Are you sure you want to delete this group? This action cannot be undone on the blockchain.")) {
      onDeleteGroup(groupId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "missed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Up to date"
      case "pending":
        return "Payment due"
      case "missed":
        return "Payment missed"
      default:
        return "Unknown"
    }
  }

  // Calculate total saved BNB across all groups
  const totalSaved = groups.reduce((sum, group) => sum + group.currentAmount, 0)

  // Calculate total aura points for the current user across all groups
  const totalAuraPoints = groups.reduce((sum, group) => {
    const userMember = group.members.find((member) => member.address === address)
    return sum + (userMember?.auraPoints || 0)
  }, 0)

  const onTimeRate =
    groups.length > 0 ? (groups.filter((group) => group.status === "active").length / groups.length) * 100 : 0

  if (!address) {
    return (
      <div className="text-center py-12">
        <h3 className="text-white text-xl mb-4">Connect your wallet to view your savings groups</h3>
        <p className="text-white/70">You need to connect your wallet to access the dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Your <span className="text-concordia-pink">Savings Dashboard</span>
        </h2>
        
        {/* Aura Points Display */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-concordia-pink/10 to-concordia-light-purple/10 border border-concordia-pink/30 rounded-lg p-4 inline-block">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">💫</div>
              <span className="text-2xl font-bold text-white">{totalAuraPoints}</span>
              <span className="text-white/80">Aura Points</span>
            </div>
            <p className="text-white/60 text-sm mt-1">Earned from your contributions</p>
          </div>
        </div>
        <p className="text-white/80 text-lg">Manage your active savings groups and track progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-concordia-purple/20 border-concordia-light-purple/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-concordia-pink mb-2">{groups.length}</div>
            <div className="text-white/80 text-sm">Active Groups</div>
          </CardContent>
        </Card>
        <Card className="bg-concordia-purple/20 border-concordia-light-purple/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-concordia-light-purple mb-2">{totalSaved.toFixed(3)} BNB</div>
            <div className="text-white/80 text-sm">Total Saved</div>
          </CardContent>
        </Card>
        <Card className="bg-concordia-purple/20 border-concordia-light-purple/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-concordia-pink mb-2">{totalAuraPoints}</div>
            <div className="text-white/80 text-sm">Your Aura Points</div>
          </CardContent>
        </Card>
        <Card className="bg-concordia-purple/20 border-concordia-light-purple/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-concordia-light-purple mb-2">{onTimeRate.toFixed(0)}%</div>
            <div className="text-white/80 text-sm">On-time Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Groups */}
      {groups.length === 0 ? (
        <Card className="bg-concordia-purple/20 border-concordia-light-purple/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-concordia-pink mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">No Active Savings Groups</h3>
            <p className="text-white/70 mb-6">
              You haven't created or joined any savings groups yet. Start one to achieve your goals!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#F042FF] to-[#7226FF] hover:from-[#F042FF]/90 hover:to-[#7226FF]/90 text-white font-semibold shadow-lg"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("navigateToCreate"))
                }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Group
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-concordia-light-purple/50 text-concordia-light-purple hover:bg-concordia-light-purple/10 font-semibold shadow-lg"
                onClick={() => setJoinGroupModalOpen(true)}
              >
                <Users className="h-5 w-5 mr-2" />
                Join Existing Group
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {groups.map((group, index) => {
            const userMember = group.members.find((member) => member.address === address)
            const { isAdmin } = groupRoles[index]

            return (
              <Card
                key={group.id}
                className="bg-concordia-purple/20 border-concordia-light-purple/30 backdrop-blur-sm hover:border-concordia-pink/50 transition-all"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-xl flex items-center">
                        {group.name}
                        {isAdmin && <Crown className="h-4 w-4 ml-2 text-yellow-400" />}
                      </CardTitle>
                      <CardDescription className="text-white/70">{group.goal}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{group.status}</Badge>
                      {userMember && (
                        <div className="text-xs text-concordia-pink font-semibold">
                          {userMember.auraPoints} Aura Points
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/80">Progress</span>
                      <span className="text-concordia-pink font-semibold">
                        {group.currentAmount} / {group.targetAmount} BNB
                      </span>
                    </div>
                    <Progress
                      value={(group.currentAmount / group.targetAmount) * 100}
                      className="h-2 bg-concordia-light-purple/20"
                    />
                    <div className="text-xs text-white/60 mt-1">
                      {Math.round((group.currentAmount / group.targetAmount) * 100)}% complete
                    </div>
                  </div>

                  {/* Group Members */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-semibold text-sm">Members ({group.members.length})</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInviteFriend(group.id)}
                        className="border-concordia-light-purple/50 text-concordia-light-purple hover:bg-concordia-light-purple/10 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Invite
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {group.members.map((member, memberIndex) => (
                        <div
                          key={memberIndex}
                          className="flex items-center justify-between p-2 bg-concordia-dark-blue/30 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-concordia-light-purple/20 text-concordia-pink text-xs">
                                {member.nickname[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-white text-sm font-medium flex items-center">
                                {member.nickname}
                                {member.address === group.createdBy && (
                                  <Crown className="h-3 w-3 ml-1 text-yellow-400" />
                                )}
                              </div>
                              <div className="text-white/60 text-xs">
                                {member.contributed} BNB • {member.auraPoints} Aura
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={"w-2 h-2 rounded-full " + getStatusColor(member.status)}></div>
                            <span className="text-xs text-white/70">{getStatusText(member.status)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Contribution */}
                  <div className="bg-concordia-light-purple/10 rounded-lg p-4 border border-concordia-light-purple/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold text-sm">Next Contribution</div>
                        <div className="text-white/70 text-xs">
                          Due: {group.nextContribution}
                          {new Date() < new Date(group.nextContribution) && (
                            <span className="text-concordia-pink ml-2">🎉 Early = +5 Aura!</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-concordia-pink font-bold">{group.contributionAmount} BNB</div>
                        <Button
                          size="sm"
                          onClick={() => handleContribute(group.id)}
                          disabled={isContributing}
                          className="bg-gradient-to-r from-[#F042FF] to-[#7226FF] hover:from-[#F042FF]/90 hover:to-[#7226FF]/90 text-white text-xs mt-1 font-semibold"
                        >
                          {isContributing ? "Contributing..." : "Contribute Now"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Group Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGroup(group)
                        setIsDetailsModalOpen(true)
                      }}
                      className="flex-1 border-concordia-light-purple/50 text-concordia-light-purple hover:bg-concordia-light-purple/10"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGroupForDueDate(group)
                        setDueDateModalOpen(true)
                      }}
                      className="border-concordia-pink/50 text-concordia-pink hover:bg-concordia-pink/10 bg-transparent"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-concordia-pink/50 text-concordia-pink hover:bg-concordia-pink/10 bg-transparent"
                      onClick={() => navigator.clipboard.writeText(group.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(group.id)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create New Group CTA */}
      {groups.length > 0 && (
        <Card className="bg-gradient-to-r from-concordia-pink/10 to-concordia-light-purple/10 border-concordia-pink/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-concordia-pink mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Ready for Another Goal?</h3>
            <p className="text-white/70 mb-6">Create a new savings group and invite your friends to join</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#F042FF] to-[#7226FF] hover:from-[#F042FF]/90 hover:to-[#7226FF]/90 text-white font-semibold shadow-lg"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("navigateToCreate"))
                }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Group
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-concordia-light-purple/50 text-concordia-light-purple hover:bg-concordia-light-purple/10 font-semibold shadow-lg"
                onClick={() => setJoinGroupModalOpen(true)}
              >
                <Users className="h-5 w-5 mr-2" />
                Join Existing Group
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <GroupDetailsModal
        group={selectedGroup}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedGroup(null)
        }}
      />
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => {
          setInviteModalOpen(false)
          setSelectedGroupForInvite(null)
        }}
        groupId={selectedGroupForInvite?.id || ""}
        groupName={selectedGroupForInvite?.name || ""}
        groups={groups}
        onInviteSent={handleInviteSent}
      />
      <ContributionModal
        isOpen={contributionModalOpen}
        onClose={() => {
          setContributionModalOpen(false)
          setSelectedGroupForContribution(null)
        }}
        group={selectedGroupForContribution}
        onSuccess={handleContributionSuccess}
      />
      <DueDateManager
        isOpen={dueDateModalOpen}
        onClose={() => {
          setDueDateModalOpen(false)
          setSelectedGroupForDueDate(null)
        }}
        group={selectedGroupForDueDate}
        onUpdate={handleDueDateUpdate}
      />
      <JoinGroupModal
        isOpen={joinGroupModalOpen}
        onClose={() => setJoinGroupModalOpen(false)}
        onJoinSuccess={(groupId, groupName) => {
          console.log(`Successfully joined group: ${groupName} (${groupId})`)
          // Refresh groups or handle the join success
        }}
      />
    </div>
  )
}
