import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiImage } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const EMPTY = { name: '', description: '', price: '', stock: '', category_id: '', matiere: '', tailles: '', couleurs: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const { t } = useTranslation()
  const [products, setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const load = () => {
    setLoading(true)
    api.get('/products', { params: { page, search, per_page: 10 } })
      .then(r => { setProducts(r.data.data || []); setMeta(r.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data))
  }, [])

  useEffect(() => { load() }, [page, search])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setImageFile(null); setModal(true) }
  const openEdit = p => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description, price: p.price, stock: p.stock,
      category_id: p.category_id, matiere: p.matiere || '', tailles: p.tailles || '', couleurs: p.couleurs || ''
    })
    setImageFile(null)
    setModal(true)
  }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)

      if (editing) {
        fd.append('_method', 'PUT')
        await api.post(`/products/${editing.id}`, fd)
        toast.success('Produit modifié')
      } else {
        await api.post('/products', fd)
        toast.success('Produit créé')
      }
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Supprimer ce produit ?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Produit supprimé')
      load()
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Produits</h1>
          <p className="text-gray-500 text-sm">{meta?.total || 0} produits au total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Ajouter
          <FiPlus size={16}/> {t('button.add')}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Rechercher..." className="input-field pl-10 text-sm" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                {['Produit', 'Catégorie', 'Prix', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td></tr>
              )) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                        {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">👗</div>}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{p.description?.substring(0, 40)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">{p.category?.name}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary-600">{Number(p.price).toFixed(2)} DH</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stock} unités
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"><FiEdit2 size={15} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><FiTrash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page}/{meta.last_page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Préc.</button>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Suiv.</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-display text-xl font-bold">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Nom du produit *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Catégorie *</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input-field" required>
                    <option value="">Choisir…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Prix (DH) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Stock *</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input-field" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Matière</label>
                  <input value={form.matiere} onChange={e => setForm({ ...form, matiere: e.target.value })} className="input-field" placeholder="Ex: 100% Coton" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tailles</label>
                  <input value={form.tailles} onChange={e => setForm({ ...form, tailles: e.target.value })} className="input-field" placeholder="Ex: S,M,L,XL" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Couleurs</label>
                  <input value={form.couleurs} onChange={e => setForm({ ...form, couleurs: e.target.value })} className="input-field" placeholder="Ex: Noir,Blanc,Bleu" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Description *</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Image du produit</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors">
                    {imageFile ? (
                      <p className="text-sm text-primary-600">{imageFile.name}</p>
                    ) : (
                      <div>
                        <FiImage size={24} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Cliquez pour sélectionner une image</p>
                        {editing?.image_url && <img src={editing.image_url} alt="" className="h-16 mx-auto mt-2 rounded-lg object-cover" />}
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Sauvegarde…' : (editing ? 'Modifier' : 'Créer')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
