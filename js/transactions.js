// transactions.js - Handle all transaction-related functionality
import { supabase } from './supabase.js';
import { app } from './app.js';

const transactionsModule = {
  transactions: [],
  assets: [],
  
  async init() {
    try {
      // Check if user is authenticated
      if (!app.isAuthenticated) {
        window.location.href = './login.html';
        return;
      }
      
      await this.loadAssets();
      await this.loadTransactions();
      this.setupTransactionForm();
      this.setupFilters();
    } catch (error) {
      console.error('Error initializing transactions:', error.message);
    }
  },
  
  async loadAssets() {
    try {
      const { data, error } = await supabase
        .from('Assets')
        .select('*');
      
      if (error) throw error;
      
      this.assets = data;
      
      // Populate asset dropdown
      const assetSelect = document.getElementById('asset-select');
      if (assetSelect) {
        assetSelect.innerHTML = '<option value="">Select Asset</option>';
        this.assets.forEach(asset => {
          assetSelect.innerHTML += `<option value="${asset.AssetID}">${asset.Name} (${asset.Symbol})</option>`;
        });
      }
    } catch (error) {
      console.error('Error loading assets:', error.message);
    }
  },
  
  async loadTransactions() {
    try {
      const { data, error } = await supabase
        .from('Transactions')
        .select(`
          *,
          Assets (Name, Symbol)
        `)
        .eq('UserID', app.currentUser.id)
        .order('TransactionDate', { ascending: false });
      
      if (error) throw error;
      
      this.transactions = data;
      this.renderTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error.message);
    }
  },
  
  renderTransactions(transactions) {
    const transactionsTable = document.getElementById('transactions-table');
    const transactionsBody = document.getElementById('transactions-body');
    
    if (!transactionsBody) return;
    
    transactionsBody.innerHTML = '';
    
    if (transactions.length === 0) {
      transactionsBody.innerHTML = '<tr><td colspan="6" class="text-center">No transactions found</td></tr>';
      return;
    }
    
    transactions.forEach(transaction => {
      const row = document.createElement('tr');
      
      const totalValue = transaction.Quantity * transaction.Price;
      const typeClass = transaction.TransactionType === 'BUY' ? 'text-success' : 'text-danger';
      
      row.innerHTML = `
        <td>${new Date(transaction.TransactionDate).toLocaleDateString()}</td>
        <td>${transaction.Assets.Name} (${transaction.Assets.Symbol})</td>
        <td class="${typeClass}">${transaction.TransactionType}</td>
        <td>${transaction.Quantity}</td>
        <td>${app.formatCurrency(transaction.Price)}</td>
        <td>${app.formatCurrency(totalValue)}</td>
        <td>
          <button class="btn btn-sm btn-danger delete-transaction" data-id="${transaction.TransactionID}">Delete</button>
        </td>
      `;
      
      transactionsBody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-transaction').forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this transaction?')) {
          await this.deleteTransaction(id);
        }
      });
    });
  },
  
  setupTransactionForm() {
    const transactionForm = document.getElementById('transaction-form');
    if (!transactionForm) return;
    
    transactionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const assetId = document.getElementById('asset-select').value;
      const transactionType = document.getElementById('transaction-type').value;
      const quantity = document.getElementById('quantity').value;
      const price = document.getElementById('price').value;
      const date = document.getElementById('transaction-date').value;
      
      if (!assetId || !transactionType || !quantity || !price || !date) {
        alert('Please fill all fields');
        return;
      }
      
      try {
        const newTransaction = {
          UserID: app.currentUser.id,
          AssetID: assetId,
          TransactionDate: date,
          TransactionType: transactionType,
          Quantity: parseInt(quantity),
          Price: parseFloat(price)
        };
        
        const { data, error } = await supabase
          .from('Transactions')
          .insert([newTransaction])
          .select();
        
        if (error) throw error;
        
        // Also insert into transaction history
        await supabase
          .from('TransactionHistory')
          .insert([{
            UserID: app.currentUser.id,
            AssetID: assetId,
            TransactionDate: date,
            TransactionType: transactionType,
            Quantity: parseInt(quantity),
            Price: parseFloat(price)
          }]);
        
        alert('Transaction added successfully');
        transactionForm.reset();
        await this.loadTransactions();
      } catch (error) {
        console.error('Error adding transaction:', error.message);
        alert(`Error adding transaction: ${error.message}`);
      }
    });
  },
  
  async deleteTransaction(transactionId) {
    try {
      const { error } = await supabase
        .from('Transactions')
        .delete()
        .eq('TransactionID', transactionId);
      
      if (error) throw error;
      
      alert('Transaction deleted successfully');
      await this.loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error.message);
      alert(`Error deleting transaction: ${error.message}`);
    }
  },
  
  setupFilters() {
    const filterForm = document.getElementById('filter-form');
    if (!filterForm) return;
    
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const assetFilter = document.getElementById('filter-asset').value;
      const typeFilter = document.getElementById('filter-type').value;
      const startDate = document.getElementById('filter-start-date').value;
      const endDate = document.getElementById('filter-end-date').value;
      
      let filteredTransactions = [...this.transactions];
      
      if (assetFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.AssetID === parseInt(assetFilter));
      }
      
      if (typeFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.TransactionType === typeFilter);
      }
      
      if (startDate) {
        filteredTransactions = filteredTransactions.filter(t => new Date(t.TransactionDate) >= new Date(startDate));
      }
      
      if (endDate) {
        filteredTransactions = filteredTransactions.filter(t => new Date(t.TransactionDate) <= new Date(endDate));
      }
      
      this.renderTransactions(filteredTransactions);
    });
    
    // Reset filters
    document.getElementById('reset-filters').addEventListener('click', () => {
      filterForm.reset();
      this.renderTransactions(this.transactions);
    });
  }
};

// Initialize the transactions module when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  transactionsModule.init();
});