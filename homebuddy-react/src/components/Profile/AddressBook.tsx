"use client";

import React, { useState, useEffect } from "react";
import {
  customerService,
  SavedCustomer,
  CustomerCreateDto,
} from "@/services/customer.service";
import { BookUser, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const emptyForm: CustomerCreateDto = {
  name: "",
  email: "",
  phone: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  countryCode: "",
};

export default function AddressBook() {
  const [customers, setCustomers] = useState<SavedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CustomerCreateDto>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    const res = await customerService.getAll();
    if (res.data) setCustomers(res.data);
    else if (res.error) toast.error(res.error);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Namn och e-post krävs");
      return;
    }
    setSubmitting(true);
    if (editingId !== null) {
      const res = await customerService.update(editingId, form);
      if (res.status === 204 || res.status === 200) {
        toast.success("Kund uppdaterad");
        setForm(emptyForm);
        setEditingId(null);
        fetchCustomers();
      } else toast.error(res.error || "Kunde inte uppdatera");
    } else {
      const res = await customerService.create(form);
      if (res.data) {
        toast.success("Kund sparad");
        setForm(emptyForm);
        fetchCustomers();
      } else toast.error(res.error || "Kunde inte spara");
    }
    setSubmitting(false);
  };

  const handleEdit = (c: SavedCustomer) => {
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone ?? "",
      streetAddress: c.streetAddress ?? "",
      city: c.city ?? "",
      postalCode: c.postalCode ?? "",
      countryCode: c.countryCode ?? "",
    });
    setEditingId(c.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ta bort denna kund från adressboken?")) return;
    const res = await customerService.delete(id);
    if (res.status === 204 || res.status === 200) {
      toast.success("Kund borttagen");
      if (editingId === id) {
        setForm(emptyForm);
        setEditingId(null);
      }
      fetchCustomers();
    } else toast.error(res.error || "Kunde inte ta bort");
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <div className="rounded-2xl border border-[#362222] bg-[#1f1515]/80 p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <BookUser className="h-8 w-8 text-[#F4A261]" />
        <h2 className="text-2xl font-bold text-white">Adressbok</h2>
      </div>
      <p className="mb-6 text-sm text-gray-400">
        Spara kunduppgifter (namn, adress, e-post m.m.) för snabb åtkomst.
      </p>

      {/* Formulär */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Namn *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-[#362222] bg-[#171010] px-4 py-2 text-white placeholder-gray-500 focus:border-[#F4A261] focus:outline-none focus:ring-1 focus:ring-[#F4A261]"
              placeholder="Företagsnamn eller kontaktperson"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              E-post *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-[#362222] bg-[#171010] px-4 py-2 text-white placeholder-gray-500 focus:border-[#F4A261] focus:outline-none focus:ring-1 focus:ring-[#F4A261]"
              placeholder="epost@example.com"
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Telefon
            </label>
            <input
              type="text"
              value={form.phone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg border border-[#362222] bg-[#171010] px-4 py-2 text-white placeholder-gray-500 focus:border-[#F4A261] focus:outline-none focus:ring-1 focus:ring-[#F4A261]"
              placeholder="+46 70 123 45 67"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Land (landskod)
            </label>
            <input
              type="text"
              value={form.countryCode ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, countryCode: e.target.value }))
              }
              className="w-full rounded-lg border border-[#362222] bg-[#171010] px-4 py-2 text-white placeholder-gray-500 focus:border-[#F4A261] focus:outline-none focus:ring-1 focus:ring-[#F4A261]"
              placeholder="SE, NO, DK"
              maxLength={2}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Gatuadress
          </label>
          <input
            type="text"
            value={form.streetAddress ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, streetAddress: e.target.value }))
            }
            className="w-full rounded-lg border border-[#362222] bg-[#171010] px-4 py-2 text-white placeholder-gray-500 focus:border-[#F4A261] focus:outline-none focus:ring-1 focus:ring-[#F4A261]"
            placeholder="Storgatan 1"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Stad
            </label>
            <input
              type="text"
              value={form.city ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="w-full rounded-lg border border-[#362222] bg-[#171010] px-4 py-2 text-white placeholder-gray-500 focus:border-[#F4A261] focus:outline-none focus:ring-1 focus:ring-[#F4A261]"
              placeholder="Stockholm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Postnummer
            </label>
            <input
              type="text"
              value={form.postalCode ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, postalCode: e.target.value }))
              }
              className="w-full rounded-lg border border-[#362222] bg-[#171010] px-4 py-2 text-white placeholder-gray-500 focus:border-[#F4A261] focus:outline-none focus:ring-1 focus:ring-[#F4A261]"
              placeholder="111 22"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#F4A261] px-5 py-2.5 font-medium text-[#171010] transition hover:bg-[#e09050] disabled:opacity-50"
          >
            {editingId !== null ? (
              <>
                <Pencil className="h-4 w-4" />
                Uppdatera
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Lägg till kund
              </>
            )}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-[#362222] px-5 py-2.5 font-medium text-gray-300 transition hover:bg-[#362222]"
            >
              Avbryt
            </button>
          )}
        </div>
      </form>

      {/* Lista / Tabell */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">
          Sparade kunder ({customers.length})
        </h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F4A261] border-t-transparent" />
          </div>
        ) : customers.length === 0 ? (
          <p className="rounded-lg border border-[#362222] bg-[#171010]/50 py-8 text-center text-gray-400">
            Inga kunder sparade ännu. Fyll i formuläret ovan och klicka på
            &quot;Lägg till kund&quot;.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#362222]">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#362222] bg-[#171010]">
                  <th className="px-4 py-3 font-medium text-gray-300">Namn</th>
                  <th className="px-4 py-3 font-medium text-gray-300">E-post</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Telefon</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Adress</th>
                  <th className="px-4 py-3 font-medium text-gray-300 w-24">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[#362222]/70 hover:bg-[#1f1515]/50"
                  >
                    <td className="px-4 py-3 text-white">{c.name}</td>
                    <td className="px-4 py-3 text-gray-300">{c.email}</td>
                    <td className="px-4 py-3 text-gray-300">{c.phone ?? "—"}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-gray-300">
                      {[c.streetAddress, c.postalCode, c.city]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(c)}
                          className="rounded p-1.5 text-gray-400 transition hover:bg-[#362222] hover:text-[#F4A261]"
                          aria-label="Redigera"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="rounded p-1.5 text-gray-400 transition hover:bg-[#362222] hover:text-red-400"
                          aria-label="Ta bort"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
