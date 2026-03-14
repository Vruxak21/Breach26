"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Plus,
  Trash2,
  Loader2,
  BarChart3,
  X,
} from "lucide-react";

interface PollOption {
  id: string;
  text: string;
  votes: {
    id: string;
    userId: string;
    user: { id: string; name: string; image: string | null };
  }[];
}

interface Poll {
  id: string;
  question: string;
  createdBy: string;
  createdAt: string;
  author: { id: string; name: string; image: string | null };
  options: PollOption[];
}

interface VotingPanelProps {
  itineraryId: string | null;
}

export function VotingPanel({ itineraryId }: VotingPanelProps) {
  const { data: session } = useSession();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [creating, setCreating] = useState(false);
  const [votingPollId, setVotingPollId] = useState<string | null>(null);
  const [deletingPollId, setDeletingPollId] = useState<string | null>(null);

  useEffect(() => {
    if (!itineraryId) return;
    setIsLoading(true);
    fetch(`/api/itinerary/${itineraryId}/polls`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setPolls(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [itineraryId]);

  const handleCreatePoll = async () => {
    if (!itineraryId || !newQuestion.trim() || newOptions.filter((o) => o.trim()).length < 2) return;
    setCreating(true);

    try {
      const res = await fetch(`/api/itinerary/${itineraryId}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion.trim(),
          options: newOptions.filter((o) => o.trim()),
        }),
      });

      if (res.ok) {
        const poll = await res.json();
        setPolls((prev) => [poll, ...prev]);
        setNewQuestion("");
        setNewOptions(["", ""]);
        setShowCreateForm(false);
      }
    } catch (err) {
      console.error("Failed to create poll:", err);
    }
    setCreating(false);
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!itineraryId) return;
    setVotingPollId(pollId);

    try {
      const res = await fetch(`/api/itinerary/${itineraryId}/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });

      if (res.ok) {
        // Refresh polls to get updated votes
        const pollsRes = await fetch(`/api/itinerary/${itineraryId}/polls`);
        if (pollsRes.ok) {
          const data = await pollsRes.json();
          setPolls(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    }
    setVotingPollId(null);
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!itineraryId) return;
    setDeletingPollId(pollId);

    try {
      const res = await fetch(`/api/itinerary/${itineraryId}/polls/${pollId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPolls((prev) => prev.filter((p) => p.id !== pollId));
      }
    } catch (err) {
      console.error("Failed to delete poll:", err);
    }
    setDeletingPollId(null);
  };

  const addOption = () => {
    setNewOptions([...newOptions, ""]);
  };

  const removeOption = (idx: number) => {
    if (newOptions.length <= 2) return;
    setNewOptions(newOptions.filter((_, i) => i !== idx));
  };

  const updateOption = (idx: number, val: string) => {
    const copy = [...newOptions];
    copy[idx] = val;
    setNewOptions(copy);
  };

  if (!itineraryId) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-6">
        <BarChart3 className="mb-3 h-10 w-10 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">Select a trip to view polls</p>
        <p className="mt-1 text-xs text-slate-400">Choose a trip from the selector above</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Voting</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
        >
          <Plus className="h-3.5 w-3.5" />
          New Poll
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Create Poll Form */}
        {showCreateForm && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="What's the question?"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />

            <div className="space-y-2">
              {newOptions.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  />
                  {newOptions.length > 2 && (
                    <button
                      onClick={() => removeOption(idx)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={addOption}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                + Add option
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewQuestion("");
                    setNewOptions(["", ""]);
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePoll}
                  disabled={creating || !newQuestion.trim() || newOptions.filter((o) => o.trim()).length < 2}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {creating && <Loader2 className="h-3 w-3 animate-spin" />}
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Polls List */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : polls.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <BarChart3 className="mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">No polls yet</p>
            <p className="mt-1 text-xs text-slate-400">Create one to start voting!</p>
          </div>
        ) : (
          polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
            const myVoteOptionId = poll.options.find((opt) =>
              opt.votes.some((v) => v.userId === session?.user?.id)
            )?.id;
            const isCreator = poll.createdBy === session?.user?.id;

            return (
              <div key={poll.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900">{poll.question}</h3>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      by {poll.author.name} · {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {isCreator && (
                    <button
                      onClick={() => handleDeletePoll(poll.id)}
                      disabled={deletingPollId === poll.id}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                    >
                      {deletingPollId === poll.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {poll.options.map((option) => {
                    const pct = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
                    const isMyVote = option.id === myVoteOptionId;
                    const isVoting = votingPollId === poll.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleVote(poll.id, option.id)}
                        disabled={isVoting}
                        className={`relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition ${
                          isMyVote
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/50"
                        }`}
                      >
                        {/* Progress bar background */}
                        <div
                          className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                            isMyVote ? "bg-indigo-100" : "bg-slate-100"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                        <div className="relative flex items-center justify-between">
                          <span className={`font-medium ${isMyVote ? "text-indigo-700" : "text-slate-700"}`}>
                            {option.text}
                          </span>
                          <span className={`text-xs font-bold ${isMyVote ? "text-indigo-600" : "text-slate-500"}`}>
                            {pct}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
