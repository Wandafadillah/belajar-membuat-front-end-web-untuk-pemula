// =========================================================
// Personal Finance & Expense Tracker App
// Semua logika ditulis dengan JavaScript murni (tanpa library)
// =========================================================

const STORAGE_KEY = 'expense-tracker-transactions';
const TRANSACTIONS_UPDATED_EVENT = 'transactions-updated';

// ---------------------------------------------------------
// State
// ---------------------------------------------------------
let transactions = [];
let editingId = null; // null = mode tambah, selain itu = mode edit

// ---------------------------------------------------------
// DOM References
// ---------------------------------------------------------
const transactionForm = document.getElementById('transactionForm');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const typeInput = document.getElementById('type');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formTitle = document.getElementById('formTitle');

const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');
const searchInput = document.getElementById('searchInput');

const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');

// ---------------------------------------------------------
// Storage helpers (Kriteria 2 - Basic)
// ---------------------------------------------------------
function loadTransactions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Gagal membaca data dari localStorage:', error);
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  // Kriteria 2 - Advanced: sinyal perubahan data lewat Custom Event
  document.dispatchEvent(new CustomEvent(TRANSACTIONS_UPDATED_EVENT));
}

// ---------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------
function formatRupiah(amount) {
  return 'Rp' + Number(amount).toLocaleString('id-ID');
}

function formatTypeLabel(type) {
  return type === 'income' ? 'Pemasukan' : 'Pengeluaran';
}

// ---------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------
function addTransaction(transaction) {
  transactions.push(transaction);
  saveTransactions();
}

function updateTransaction(id, updatedFields) {
  transactions = transactions.map((trx) =>
    trx.id === id ? { ...trx, ...updatedFields } : trx
  );
  saveTransactions();
}

function deleteTransaction(id) {
  transactions = transactions.filter((trx) => trx.id !== id);
  saveTransactions();
}

function toggleTransactionType(id) {
  const target = transactions.find((trx) => trx.id === id);
  if (!target) return;
  const newType = target.type === 'income' ? 'expense' : 'income';
  updateTransaction(id, { type: newType });
}

function getTransactionById(id) {
  return transactions.find((trx) => trx.id === id);
}

// ---------------------------------------------------------
// Rendering (Kriteria 1 - Basic)
// Menggunakan document.createElement(), BUKAN innerHTML +=
// ---------------------------------------------------------
function createTransactionElement(transaction) {
  const item = document.createElement('div');
  item.setAttribute('data-testid', 'transactionItem');
  item.classList.add(
    'transaction-item',
    transaction.type === 'income' ? 'transaction-item--income' : 'transaction-item--expense'
  );

  const title = document.createElement('h3');
  title.setAttribute('data-testid', 'transactionItemTitle');
  title.textContent = transaction.title;

  const amount = document.createElement('p');
  amount.setAttribute('data-testid', 'transactionItemAmount');
  amount.textContent = `Nominal: ${formatRupiah(transaction.amount)}`;

  const date = document.createElement('p');
  date.setAttribute('data-testid', 'transactionItemDate');
  date.textContent = `Tanggal: ${transaction.date}`;

  const type = document.createElement('p');
  type.setAttribute('data-testid', 'transactionItemType');
  type.textContent = `Tipe: ${formatTypeLabel(transaction.type)}`;

  const actionWrapper = document.createElement('div');
  actionWrapper.classList.add('transaction-item__actions');

  // Tombol Edit tambahan (Kriteria 2 - Skilled: mengisi form untuk edit penuh)
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.classList.add('transaction-item__edit-btn');
  editBtn.type = 'button';
  editBtn.addEventListener('click', () => enterEditMode(transaction.id));

  // Tombol Ubah Tipe (Kriteria 3 - Basic)
  const editTypeBtn = document.createElement('button');
  editTypeBtn.setAttribute('data-testid', 'transactionItemEditTypeButton');
  editTypeBtn.textContent = 'Ubah Tipe';
  editTypeBtn.type = 'button';
  editTypeBtn.addEventListener('click', () => toggleTransactionType(transaction.id));

  // Tombol Hapus
  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('data-testid', 'transactionItemDeleteButton');
  deleteBtn.textContent = 'Hapus';
  deleteBtn.type = 'button';
  deleteBtn.addEventListener('click', () => {
    deleteTransaction(transaction.id);
    // Jika transaksi yang sedang diedit dihapus, kembalikan form ke mode tambah
    if (editingId === transaction.id) {
      exitEditMode();
    }
  });

  actionWrapper.appendChild(editBtn);
  actionWrapper.appendChild(editTypeBtn);
  actionWrapper.appendChild(deleteBtn);

  item.appendChild(title);
  item.appendChild(amount);
  item.appendChild(date);
  item.appendChild(type);
  item.appendChild(actionWrapper);

  return item;
}

function createEmptyState(message) {
  const empty = document.createElement('p');
  empty.classList.add('transactions__empty');
  empty.textContent = message;
  return empty;
}

function renderTransactions(filterKeyword = '') {
  // Kosongkan daftar tanpa innerHTML += (aman untuk render ulang)
  incomeList.innerHTML = '';
  expenseList.innerHTML = '';

  const keyword = filterKeyword.trim().toLowerCase();
  const filtered = keyword
    ? transactions.filter((trx) => trx.title.toLowerCase().includes(keyword))
    : transactions;

  const incomeTransactions = filtered.filter((trx) => trx.type === 'income');
  const expenseTransactions = filtered.filter((trx) => trx.type === 'expense');

  if (incomeTransactions.length === 0) {
    incomeList.appendChild(createEmptyState('Belum ada transaksi pemasukan.'));
  } else {
    incomeTransactions.forEach((trx) => {
      incomeList.appendChild(createTransactionElement(trx));
    });
  }

  if (expenseTransactions.length === 0) {
    expenseList.appendChild(createEmptyState('Belum ada transaksi pengeluaran.'));
  } else {
    expenseTransactions.forEach((trx) => {
      expenseList.appendChild(createTransactionElement(trx));
    });
  }
}

// ---------------------------------------------------------
// Dashboard (Kriteria 1 - Advanced)
// ---------------------------------------------------------
function renderDashboard() {
  const totalIncome = transactions
    .filter((trx) => trx.type === 'income')
    .reduce((sum, trx) => sum + Number(trx.amount), 0);

  const totalExpense = transactions
    .filter((trx) => trx.type === 'expense')
    .reduce((sum, trx) => sum + Number(trx.amount), 0);

  const balance = totalIncome - totalExpense;

  totalBalanceEl.textContent = formatRupiah(balance);
  totalIncomeEl.textContent = formatRupiah(totalIncome);
  totalExpenseEl.textContent = formatRupiah(totalExpense);
}

// ---------------------------------------------------------
// Render orkestrator - dipanggil oleh listener Custom Event
// ---------------------------------------------------------
function renderAll() {
  renderTransactions(searchInput.value);
  renderDashboard();
}

document.addEventListener(TRANSACTIONS_UPDATED_EVENT, renderAll);

// ---------------------------------------------------------
// Form: mode tambah & mode edit (Kriteria 2 - Skilled)
// ---------------------------------------------------------
function enterEditMode(id) {
  const transaction = getTransactionById(id);
  if (!transaction) return;

  editingId = id;
  titleInput.value = transaction.title;
  amountInput.value = transaction.amount;
  dateInput.value = transaction.date;
  typeInput.value = transaction.type;

  formTitle.textContent = 'Edit Transaksi';
  submitBtn.textContent = 'Perbarui';
  cancelEditBtn.hidden = false;

  titleInput.focus();
}

function exitEditMode() {
  editingId = null;
  transactionForm.reset();
  formTitle.textContent = 'Tambah Transaksi';
  submitBtn.textContent = 'Simpan';
  cancelEditBtn.hidden = true;
}

cancelEditBtn.addEventListener('click', exitEditMode);

// ---------------------------------------------------------
// Form submit + validasi (Kriteria 1 - Skilled)
// ---------------------------------------------------------
transactionForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const type = typeInput.value;

  // Validasi: judul tidak boleh kosong, nominal minimal 1 rupiah
  if (title === '') {
    alert('Judul transaksi tidak boleh kosong!');
    return;
  }

  if (!amount || amount < 1) {
    alert('Nominal harus diisi dan minimal Rp1!');
    return;
  }

  if (date === '') {
    alert('Tanggal transaksi harus diisi!');
    return;
  }

  if (editingId !== null) {
    // Mode edit: perbarui transaksi yang ada
    updateTransaction(editingId, { title, amount, date, type });
    exitEditMode();
  } else {
    // Mode tambah: buat transaksi baru
    const newTransaction = {
      id: +new Date(),
      title,
      amount,
      date,
      type,
    };
    addTransaction(newTransaction);
    transactionForm.reset();
  }
});

// ---------------------------------------------------------
// Pencarian (Kriteria 3 - Skilled & Advanced)
// ---------------------------------------------------------
searchInput.addEventListener('input', () => {
  renderTransactions(searchInput.value);
});

// ---------------------------------------------------------
// Inisialisasi Aplikasi
// ---------------------------------------------------------
function init() {
  transactions = loadTransactions();
  renderAll();
}

init();
