"use client";

import { useCallback,useEffect,useState } from "react";
import { Bell,Check } from "lucide-react";

type Notification={id:string;title:string;body:string;read_at:string|null;created_at:string};

export function AdminNotifications() {
  const [open,setOpen]=useState(false);const [items,setItems]=useState<Notification[]>([]);const [unread,setUnread]=useState(0);
  const load=useCallback(async()=>{const response=await fetch("/api/admin/notifications?limit=20");if(!response.ok)return;const body=await response.json() as {items:Notification[];unreadCount:number};setItems(body.items);setUnread(body.unreadCount);},[]);
  useEffect(()=>{void load();const interval=setInterval(load,30_000);return()=>clearInterval(interval);},[load]);
  const read=async(id:string)=>{await fetch(`/api/admin/notifications/${id}/read`,{method:"PATCH"});await load();};
  return <div className="relative"><button onClick={()=>{setOpen((value)=>!value);void load();}} aria-label="Notificações" className="relative p-2 text-white/70 hover:text-white"><Bell size={17}/>{unread>0&&<span className="absolute right-0 top-0 min-w-4 rounded-full bg-[#7A2535] px-1 text-center text-[9px] leading-4 text-white">{unread}</span>}</button>{open&&<div className="absolute right-0 top-11 z-50 w-[min(90vw,390px)] border border-black/10 bg-white p-4 text-[#191010] shadow-2xl"><div className="mb-3 flex items-center justify-between"><h2 className="text-[10px] uppercase tracking-[0.18em]">Notificações</h2><span className="text-[10px] text-black/40">{unread} não lidas</span></div><div className="max-h-[60vh] space-y-2 overflow-y-auto">{items.length?items.map((item)=><article key={item.id} className={`border p-3 ${item.read_at?"border-black/5 bg-white":"border-[#2E8E8E]/30 bg-[#F7F4EE]"}`}><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-medium">{item.title}</h3><p className="mt-1 text-xs leading-relaxed text-black/60">{item.body}</p><time className="mt-2 block text-[9px] uppercase tracking-[0.1em] text-black/35">{new Date(item.created_at).toLocaleString("pt-BR")}</time></div>{!item.read_at&&<button onClick={()=>read(item.id)} aria-label="Marcar como lida" className="p-1 text-[#2E8E8E]"><Check size={15}/></button>}</div></article>):<p className="py-6 text-center text-sm text-black/35">Nenhuma notificação.</p>}</div></div>}</div>;
}
