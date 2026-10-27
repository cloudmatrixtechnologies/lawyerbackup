import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Meta } from '@angular/platform-browser';

type Status = 'NEW' | 'CONTACTED' | 'COMPLETED';
type SortField = 'createdAt' | 'name' | 'status' | 'area' | 'completedAt';

interface Booking {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  message: string;
  status: Status;
  completedAt: string | null;
}

interface PageResponse {
  items: Booking[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

@Component({
  selector: 'app-admin',
  imports: [DatePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  readonly statuses: Status[] = ['NEW', 'CONTACTED', 'COMPLETED'];
  readonly statusLabel: Record<Status, string> = { NEW: 'New', CONTACTED: 'Contacted', COMPLETED: 'Completed' };
  readonly areas = [
    'Civil Cases & Litigation', 'Criminal Cases & Defence', 'Legal Advisory & Consultation',
    'Property & Documentation', 'Family Law', 'Other',
  ];
  readonly sortOptions: { label: string; sort: SortField; dir: 'asc' | 'desc' }[] = [
    { label: 'Newest first',        sort: 'createdAt',   dir: 'desc' },
    { label: 'Oldest first',        sort: 'createdAt',   dir: 'asc'  },
    { label: 'Name A–Z',            sort: 'name',        dir: 'asc'  },
    { label: 'Name Z–A',            sort: 'name',        dir: 'desc' },
    { label: 'Status',              sort: 'status',      dir: 'asc'  },
    { label: 'Practice area',       sort: 'area',        dir: 'asc'  },
    { label: 'Recently completed',  sort: 'completedAt', dir: 'desc' },
  ];

  view = signal<'checking' | 'login' | 'list'>('checking');
  loading = signal(false);
  error = signal('');
  password = '';

  // Filters / sort / paging — all applied by the server (PostgreSQL)
  search = signal('');
  status = signal<Status | ''>('');
  area = signal('');
  from = signal('');
  to = signal('');
  sort = signal<SortField>('createdAt');
  dir = signal<'asc' | 'desc'>('desc');
  page = signal(0);

  result = signal<PageResponse>({ items: [], total: 0, page: 0, size: PAGE_SIZE, totalPages: 0 });
  counts = signal<Record<'ALL' | Status, number>>({ ALL: 0, NEW: 0, CONTACTED: 0, COMPLETED: 0 });

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  async ngOnInit() {
    const res = await fetch('/api/admin/session').catch(() => null);
    if (res?.ok) await this.refresh();
    else this.view.set('login');
  }

  // ── Auth ──
  async login() {
    this.error.set('');
    this.loading.set(true);
    try {
      const res = await this.api('/api/admin/login', 'POST', { password: this.password });
      if (!res.ok) { this.error.set(await this.errorOf(res, 'Login failed.')); return; }
      this.password = '';
      await this.refresh();
    } catch {
      this.error.set('Cannot reach the server. Is the booking service running?');
    } finally {
      this.loading.set(false);
    }
  }

  async logout() {
    await this.api('/api/admin/logout', 'POST').catch(() => null);
    this.view.set('login');
  }

  // ── Loading ──
  async refresh() {
    await Promise.all([this.load(), this.loadCounts()]);
  }

  async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      const res = await fetch('/api/admin/bookings?' + this.query(this.page(), PAGE_SIZE));
      if (res.status === 401) { this.view.set('login'); return; }
      if (!res.ok) throw new Error(await this.errorOf(res, 'Could not load bookings.'));
      this.result.set(await res.json());
      this.view.set('list');
    } catch (e: any) {
      this.error.set(e instanceof TypeError ? 'Cannot reach the server. Is the booking service running?' : e.message);
    } finally {
      this.loading.set(false);
    }
  }

  async loadCounts() {
    const res = await fetch('/api/admin/bookings/stats').catch(() => null);
    if (res?.ok) this.counts.set(await res.json());
  }

  // ── Filter / sort / page controls ──
  onSearch(value: string) {
    this.search.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.applyFilters(), 300);
  }

  applyFilters() {
    this.page.set(0);
    this.load();
  }

  setStatusTab(s: Status | '') {
    this.status.set(s);
    this.applyFilters();
  }

  setSortOption(index: number) {
    const o = this.sortOptions[index];
    this.sort.set(o.sort);
    this.dir.set(o.dir);
    this.applyFilters();
  }

  /** Column header click: same column toggles direction, new column starts sensible default. */
  sortBy(field: SortField) {
    if (this.sort() === field) this.dir.set(this.dir() === 'asc' ? 'desc' : 'asc');
    else { this.sort.set(field); this.dir.set(field === 'name' || field === 'area' ? 'asc' : 'desc'); }
    this.applyFilters();
  }

  sortIndex() {
    return this.sortOptions.findIndex(o => o.sort === this.sort() && o.dir === this.dir());
  }

  arrow(field: SortField) {
    return this.sort() === field ? (this.dir() === 'asc' ? '↑' : '↓') : '';
  }

  hasFilters() {
    return !!(this.search() || this.status() || this.area() || this.from() || this.to());
  }

  clearFilters() {
    this.search.set(''); this.status.set(''); this.area.set(''); this.from.set(''); this.to.set('');
    this.applyFilters();
  }

  goToPage(p: number) {
    this.page.set(p);
    this.load();
    window.scrollTo({ top: 0 });
  }

  // ── Actions ──
  markCompleted(b: Booking) {
    return this.setStatus(b, 'COMPLETED');
  }

  async setStatus(b: Booking, status: Status) {
    const res = await this.api(`/api/admin/bookings/${b.id}/status`, 'PATCH', { status });
    if (res.status === 401) { this.view.set('login'); return; }
    if (!res.ok) { this.error.set(await this.errorOf(res, 'Could not update status.')); return; }
    const updated: Booking = await res.json();
    this.result.update(r => ({ ...r, items: r.items.map(x => x.id === b.id ? updated : x) }));
    this.loadCounts();
  }

  async remove(b: Booking) {
    if (!confirm(`Delete the booking from ${b.name}? This cannot be undone.`)) return;
    const res = await this.api(`/api/admin/bookings/${b.id}`, 'DELETE');
    if (res.status === 401) { this.view.set('login'); return; }
    if (!res.ok) { this.error.set(await this.errorOf(res, 'Could not delete booking.')); return; }
    await this.refresh();
  }

  /** Exports every booking matching the current filters and sort (all pages). */
  async exportCsv() {
    const rows: Booking[] = [];
    for (let p = 0; ; p++) {
      const res = await fetch('/api/admin/bookings?' + this.query(p, 100));
      if (!res.ok) { this.error.set('Could not export bookings.'); return; }
      const page: PageResponse = await res.json();
      rows.push(...page.items);
      if (p >= page.totalPages - 1) break;
    }
    const cols: (keyof Booking)[] = ['createdAt', 'name', 'phone', 'email', 'area', 'message', 'status', 'completedAt'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.join(','), ...rows.map(b => cols.map(c => esc(b[c])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `bookings-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }

  whatsapp(phone: string) {
    const digits = phone.replace(/\D/g, '');
    return `https://wa.me/${digits.length === 10 ? '91' + digits : digits}`;
  }

  // ── Helpers ──
  private query(page: number, size: number) {
    const p = new URLSearchParams({ sort: this.sort(), dir: this.dir(), page: String(page), size: String(size) });
    if (this.search().trim()) p.set('q', this.search().trim());
    if (this.status()) p.set('status', this.status());
    if (this.area()) p.set('area', this.area());
    if (this.from()) p.set('from', this.from());
    if (this.to()) p.set('to', this.to());
    return p.toString();
  }

  private async errorOf(res: Response, fallback: string) {
    const body = await res.json().catch(() => ({}));
    return body.error || fallback;
  }

  private api(url: string, method: string, body?: unknown) {
    return fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
}
