document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const user = await requireAuth();
    
    // Set user name in header
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      const { data } = await supabase
        .from('Users')
        .select('Name')
        .eq('UserID', user.id)
        .single();
      
      if (data) {
        userNameElement.textContent = data.Name;
      }
    }
    
    // Load portfolios
    const portfoliosListElement = document.getElementById('portfolios-list');
    if (portfoliosListElement) {
      const { data: portfolios } = await supabase
        .from('Portfolios')
        .select('*')
        .eq('UserID', user.id);
      
      if (portfolios && portfolios.length > 0) {
        let portfoliosHTML = '';
        
        portfolios.forEach(portfolio => {
          portfoliosHTML += `
            <div class="portfolio-card" data-id="${portfolio.PortfolioID}">
              <div class="portfolio-header">
                <h2>${portfolio.PortfolioName}</h2>
                <div class="portfolio-value">$${parseFloat(portfolio.PortfolioValue).toFixed(2)}</div>
              </div>
              <div class="portfolio-actions">
                <button class="btn btn-sm view-portfolio" data-id="${portfolio.PortfolioID}">View Details</button>
                <button class="btn btn-sm btn-danger delete-portfolio" data-id="${portfolio.PortfolioID}">Delete</button>
              </div>
            </div>
          `;
        });
        
        portfoliosListElement.innerHTML = portfoliosHTML;
        
        // Add event listeners for portfolio actions
        document.querySelectorAll('.view-portfolio').forEach(button => {
          button.addEventListener('click', viewPortfolio);
        });
        
        document.querySelectorAll('.delete-portfolio').forEach(button => {
          button.addEventListener('click', deletePortfolio);
        });
      } else {
        portfoliosListElement.innerHTML = `
          <div class="empty-state">
            <p>You don't have any portfolios yet.</p>
            <p>Create your first portfolio to start tracking your investments.</p>
          </div>
        `;
      }
    }
    
    // Handle portfolio modal
    const modal = document.getElementById('portfolio-modal');
    const createPortfolioBtn = document.getElementById('create-portfolio-btn');
    const closeModal = document.querySelector('.close-modal');
    
    if (createPortfolioBtn) {
      createPortfolioBtn.addEventListener('click', () => {
        modal.style.display = 'block';
      });
    }
    
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
    
    // Handle portfolio form submission
    const portfolioForm = document.getElementById('portfolio-form');
    if (portfolioForm) {
      portfolioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const portfolioName = document.getElementById('portfolio-name').value;
        
        try {
          const { data, error } = await supabase
            .from('Portfolios')
            .insert([{
              UserID: user.id,
              PortfolioName: portfolioName,
              PortfolioValue: 0
            }]);
          
          if (error) throw error;
          
          // Refresh the page to show new portfolio
          window.location.reload();
        } catch (error) {
          alert('Error creating portfolio: ' + error.message);
        }
      });
    }
    
    // View portfolio details
    async function viewPortfolio(e) {
      const portfolioId = e.target.getAttribute('data-id');
      window.location.href = `portfolio-detail.html?id=${portfolioId}`;
    }
    
    // Delete portfolio
    async function deletePortfolio(e) {
      if (confirm('Are you sure you want to delete this portfolio?')) {
        const portfolioId = e.target.getAttribute('data-id');
        
        try {
          const { error } = await supabase
            .from('Portfolios')
            .delete()
            .eq('PortfolioID', portfolioId);
          
          if (error) throw error;
          
          // Refresh the page
          window.location.reload();
        } catch (error) {
          alert('Error deleting portfolio: ' + error.message);
        }
      }
    }
  });