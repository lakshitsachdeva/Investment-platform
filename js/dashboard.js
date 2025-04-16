document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Get Supabase client from the global variable
    const supabase = window.supabase

    // Check if user is logged in
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      console.error("Auth error:", error)
      window.location.href = "login.html"
      return
    }

    // Set user name in header
    const userNameElement = document.getElementById("user-name")
    if (userNameElement) {
      const { data } = await supabase.from("Users").select("Name").eq("UserID", user.id).single()

      if (data) {
        userNameElement.textContent = data.Name
      }
    }

    // Load portfolio summary
    const portfolioSummaryElement = document.getElementById("portfolio-summary")
    if (portfolioSummaryElement) {
      const { data: portfolios } = await supabase
        .from("Portfolios")
        .select("PortfolioID, PortfolioName, PortfolioValue")
        .eq("UserID", user.id)

      if (portfolios && portfolios.length > 0) {
        const totalValue = portfolios.reduce((sum, portfolio) => sum + Number.parseFloat(portfolio.PortfolioValue), 0)

        let portfolioHTML = `
          <div class="total-value">
            <span class="label">Total Portfolio Value:</span>
            <span class="value">$${totalValue.toFixed(2)}</span>
          </div>
          <div class="portfolios-list">
        `

        portfolios.forEach((portfolio) => {
          portfolioHTML += `
            <div class="portfolio-item">
              <span class="name">${portfolio.PortfolioName}</span>
              <span class="value">$${Number.parseFloat(portfolio.PortfolioValue).toFixed(2)}</span>
            </div>
          `
        })

        portfolioHTML += `</div>`
        portfolioSummaryElement.innerHTML = portfolioHTML
      } else {
        portfolioSummaryElement.innerHTML = `
          <p>No portfolios found.</p>
          <a href="portfolio.html" class="btn btn-primary">Create Portfolio</a>
        `
      }
    }

    // Load recent transactions
    const transactionsTableBody = document.querySelector("#recent-transactions tbody")
    if (transactionsTableBody) {
      const { data: transactions } = await supabase
        .from("Transactions")
        .select(`
          TransactionID, 
          TransactionDate, 
          TransactionType, 
          Quantity, 
          Price,
          Assets (Name, Symbol)
        `)
        .eq("UserID", user.id)
        .order("TransactionDate", { ascending: false })
        .limit(5)

      if (transactions && transactions.length > 0) {
        let transactionsHTML = ""

        transactions.forEach((transaction) => {
          transactionsHTML += `
            <tr>
              <td>${new Date(transaction.TransactionDate).toLocaleDateString()}</td>
              <td>${transaction.Assets.Name} (${transaction.Assets.Symbol})</td>
              <td>${transaction.TransactionType}</td>
              <td>${transaction.Quantity}</td>
              <td>$${Number.parseFloat(transaction.Price).toFixed(2)}</td>
            </tr>
          `
        })

        transactionsTableBody.innerHTML = transactionsHTML
      } else {
        transactionsTableBody.innerHTML = `
          <tr>
            <td colspan="5">No transactions found.</td>
          </tr>
        `
      }
    }

    // Load watchlist items
    const watchlistTableBody = document.querySelector("#watchlist-items tbody")
    if (watchlistTableBody) {
      const { data: watchlist } = await supabase
        .from("Watchlist")
        .select(`
          WatchlistID,
          Assets (AssetID, Name, Symbol)
        `)
        .eq("UserID", user.id)
        .limit(5)

      if (watchlist && watchlist.length > 0) {
        let watchlistHTML = ""

        // For each watchlist item, get the latest price
        for (const item of watchlist) {
          const { data: priceData } = await supabase
            .from("MarketPrice")
            .select("ClosePrice")
            .eq("AssetID", item.Assets.AssetID)
            .order("Date", { ascending: false })
            .limit(1)
            .single()

          const price = priceData ? priceData.ClosePrice : "N/A"

          watchlistHTML += `
            <tr>
              <td>${item.Assets.Name}</td>
              <td>${item.Assets.Symbol}</td>
              <td>$${typeof price === "number" ? price.toFixed(2) : price}</td>
            </tr>
          `
        }

        watchlistTableBody.innerHTML = watchlistHTML
      } else {
        watchlistTableBody.innerHTML = `
          <tr>
            <td colspan="3">No watchlist items found.</td>
          </tr>
        `
      }
    }
  } catch (error) {
    console.error("Dashboard error:", error)
    window.location.href = "login.html"
  }
})

