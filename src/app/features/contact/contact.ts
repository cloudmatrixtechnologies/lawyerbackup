import { Component, signal } from '@angular/core';

const WHATSAPP_NUMBER = '919345170567';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  readonly whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

  sending = signal(false);
  submitted = signal(false);
  error = signal('');

  form = {
    name: '',
    phone: '',
    email: '',
    area: '',
    message: '',
    website: '', // honeypot — hidden from people, bots fill it
  };

  // Booking is saved on the server and shows up on the admin screen (/admin)
  async onSubmit() {
    const f = this.form;
    this.error.set('');
    if (!f.name.trim() || !f.phone.trim()) {
      this.error.set('Please enter your name and phone number.');
      return;
    }

    this.sending.set(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Could not send your request.');
      }
      this.submitted.set(true);
      this.form = { name: '', phone: '', email: '', area: '', message: '', website: '' };
      setTimeout(() => this.submitted.set(false), 6000);
    } catch (e: any) {
      // TypeError = network failure; otherwise the server sent a user-facing message
      this.error.set(e instanceof TypeError
        ? 'Could not send your request. Please call or WhatsApp us instead.'
        : e.message);
    } finally {
      this.sending.set(false);
    }
  }
}
