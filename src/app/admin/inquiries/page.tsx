"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { CheckCircle, Circle, X, Mail } from "lucide-react";

export default function InquiriesPage() {
  const [filterUnread, setFilterUnread] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const inquiries = useQuery(api.inquiries.list, { unreadOnly: filterUnread });
  const markRead = useMutation(api.inquiries.markRead);

  const selectedInquiry = inquiries?.find((i) => i._id === selected);

  async function handleMarkRead(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await markRead({ id: id as any });
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">Inquiries</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterUnread(false)}
            className={`px-4 py-2 rounded-full text-xs font-body transition-all cursor-pointer ${!filterUnread ? "bg-gold text-noir" : "border border-gold/20 text-muted-text hover:text-bone"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterUnread(true)}
            className={`px-4 py-2 rounded-full text-xs font-body transition-all cursor-pointer ${filterUnread ? "bg-gold text-noir" : "border border-gold/20 text-muted-text hover:text-bone"}`}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/10 overflow-hidden">
        {inquiries === undefined ? (
          <div className="p-6 flex flex-col gap-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : inquiries.length === 0 ? (
          <div className="py-16 text-center text-muted-text font-body">No inquiries{filterUnread ? " unread" : ""}</div>
        ) : (
          <ul className="divide-y divide-gold/5">
            {inquiries.map((inq) => (
              <li
                key={inq._id}
                className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors ${selected === inq._id ? "bg-bordeaux-deep/20" : "hover:bg-bordeaux-deep/10"}`}
                onClick={() => setSelected(inq._id === selected ? null : inq._id)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleMarkRead(inq._id); }}
                  title="Mark as read"
                  className="mt-0.5 flex-shrink-0 cursor-pointer text-muted-text hover:text-gold transition-colors"
                >
                  {inq.read ? <CheckCircle size={14} className="text-muted-text/40" /> : <Circle size={14} className="text-gold" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className={`text-sm ${inq.read ? "text-bone/70" : "text-bone"} font-body`}>{inq.name}</p>
                    <p className="text-xs text-muted-text font-body">{inq.email}</p>
                    <span className="ml-auto text-[10px] text-muted-text font-body">{formatDate(inq._creationTime)}</span>
                  </div>
                  <p className="text-xs text-muted-text font-body mt-1 truncate">{inq.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {selectedInquiry && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="p-6 rounded-2xl border border-gold/15 bg-bordeaux-deep/10 flex flex-col gap-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-base text-bone">Inquiry from {selectedInquiry.name}</h2>
                <p className="text-sm text-muted-text font-body mt-1">{selectedInquiry.name} · {selectedInquiry.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: Your inquiry`}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gold/20 rounded-lg text-xs text-gold hover:bg-bordeaux-deep/30 transition-colors font-body cursor-pointer"
                >
                  <Mail size={12} /> Reply
                </a>
                <button onClick={() => setSelected(null)} className="text-muted-text hover:text-bone transition-colors cursor-pointer"><X size={16} /></button>
              </div>
            </div>
            <div className="text-sm text-bone/80 font-body leading-relaxed whitespace-pre-wrap border-t border-gold/10 pt-5">
              {selectedInquiry.message}
            </div>
            <p className="text-[10px] text-muted-text font-body">{formatDate(selectedInquiry._creationTime)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
