/**
 * Deployment Status Component
 *
 * Manages the deployment status indicator in the admin header:
 * - Moves custom elements (branding, deployment status) into CMS header
 * - Fetches and displays GitHub Actions deployment status
 * - Auto-refreshes every 5 seconds
 *
 * @module components/deployment-status
 */

/**
 * Move custom elements into CMS header
 * @returns {boolean} True if elements were successfully moved
 */
function moveCustomElements() {
    const branding = document.querySelector('.admin-branding');
    const deploymentStatus = document.querySelector('.deployment-status');
    const appHeaderContent = document.querySelector('[class*="AppHeaderContent"]');

    if (!appHeaderContent) return false;

    // Insert branding at the beginning if not already there
    if (branding && !appHeaderContent.contains(branding)) {
      appHeaderContent.insertBefore(branding, appHeaderContent.firstChild);
    }

    // Insert deployment status after branding if not already there
    if (deploymentStatus && !appHeaderContent.contains(deploymentStatus)) {
      const insertPosition = branding && appHeaderContent.contains(branding)
        ? branding.nextSibling
        : appHeaderContent.firstChild;
      appHeaderContent.insertBefore(deploymentStatus, insertPosition);
    }

    return branding && deploymentStatus &&
           appHeaderContent.contains(branding) &&
           appHeaderContent.contains(deploymentStatus);
  }

  /**
   * Initialize DOM manipulation (watch for CMS to render)
   * @returns {void}
   */
  function initializeDOMManipulation() {
    // Try to move once CMS loads
    const observer = new MutationObserver(() => {
      if (moveCustomElements()) {
        observer.disconnect();
      }
    });

    // Watch for CMS to render
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also try immediately in case CMS is already loaded
    setTimeout(moveCustomElements, 1000);
  }

  /**
   * Fetch and display deployment status from GitHub Actions
   * @returns {void}
   */
  function initializeDeploymentStatus() {
    const REPO_OWNER = 'rjicha';
    const REPO_NAME = 'dgkralupy';
    const WORKFLOW_FILE = 'deploy.yml';
    const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=1`;

    const dotElement = document.getElementById('deployment-dot');
    const stateElement = document.getElementById('deployment-state');
    const timeElement = document.getElementById('deployment-time');

    /**
     * @typedef {'success'|'failure'|'cancelled'|'in_progress'|'queued'|'pending'|'waiting'|'requested'|'action_required'} DeploymentState
     */

    /** @type {Record<DeploymentState, string>} */
    const STATE_LABELS = {
      'success': 'Úspěšně nasazeno',
      'failure': 'Nasazení selhalo',
      'cancelled': 'Nasazení zrušeno',
      'in_progress': 'Probíhá nasazení',
      'queued': 'Čeká ve frontě',
      'pending': 'Čeká na spuštění',
      'waiting': 'Čeká',
      'requested': 'Ve frontě',
      'action_required': 'Vyžaduje akci'
    };

    /**
     * Format a date string as "X ago" in Czech
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted relative time string
     */
    function formatTimeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'právě teď';
      if (diffMins < 60) return `před ${diffMins} min`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `před ${diffHours} h`;

      const diffDays = Math.floor(diffHours / 24);
      return `před ${diffDays} dny`;
    }

    /**
     * Fetch and update deployment status from GitHub API
     * Auto-schedules next fetch after 5 seconds
     * @returns {Promise<void>}
     */
    async function fetchDeploymentStatus() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.workflow_runs && data.workflow_runs.length > 0) {
          const latestRun = data.workflow_runs[0];
          const status = latestRun.status;
          const conclusion = latestRun.conclusion;
          const updatedAt = latestRun.updated_at;

          let state;
          if (status === 'completed' && conclusion) {
            state = conclusion;
          } else {
            state = status;
          }

          // Update dot color
          dotElement.className = `status-dot ${state}`;

          // Update tooltip content
          stateElement.textContent = STATE_LABELS[state] || state;
          timeElement.textContent = formatTimeAgo(updatedAt);
        } else {
          dotElement.className = 'status-dot loading';
          stateElement.textContent = 'Neznámý stav';
          timeElement.textContent = '';
        }
      } catch (error) {
        console.error('Failed to fetch deployment status:', error);
        dotElement.className = 'status-dot failure';
        stateElement.textContent = 'Chyba načítání';
        timeElement.textContent = '';
      }

      // Always refresh every 5 seconds as per requirements
      setTimeout(fetchDeploymentStatus, 5000);
    }

    // Start fetching status
    fetchDeploymentStatus();
  }

/**
 * Initialize all deployment status functionality
 */
export function initialize() {
  initializeDOMManipulation();
  initializeDeploymentStatus();
}

// Auto-initialize when module loads
initialize();

console.log('✓ Deployment status component loaded');
