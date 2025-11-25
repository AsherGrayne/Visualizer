const details = {
  // Model 1 Details
  "input": {
    title: "Input Features",
    description: "The raw input data for the model. This layer accepts the standardized input vector containing all the features used for prediction."
  },
  "dense1": {
    title: "Dense Layer 1",
    description: "A fully connected layer with 512 units. It applies a linear transformation followed by a GELU activation function and Dropout (0.1) for regularization."
  },
  "se1": {
    title: "SE Block 1",
    description: "Squeeze-and-Excitation Block (8x8). This block adaptively recalibrates channel-wise feature responses by explicitly modelling interdependencies between channels."
  },
  "dense2": {
    title: "Dense Layer 2",
    description: "Second fully connected layer with 512 units, using GELU activation and Dropout (0.1). It further processes the features extracted by the previous layers."
  },
  "se2": {
    title: "SE Block 2",
    description: "Second Squeeze-and-Excitation Block (8x8). Continues to refine feature importance."
  },
  "dense3": {
    title: "Dense Layer 3",
    description: "Third fully connected layer with 512 units, GELU activation, and Dropout (0.1). Captures higher-level abstractions."
  },
  "se3": {
    title: "SE Block 3",
    description: "Third Squeeze-and-Excitation Block (8x8). Final feature recalibration before the logits."
  },
  "deep-logits": {
    title: "Deep Logits",
    description: "Output of the deep branch. It projects the processed features into N_Classes units, representing the raw scores from the deep network."
  },
  "wide-linear": {
    title: "Wide Linear",
    description: "A direct linear connection from the input to the output (Wide part). It captures simple linear relationships and memorizes feature interactions. Shape: (Batch, N_Classes)."
  },
  "add": {
    title: "Add Operation",
    description: "Element-wise addition of the Deep Logits and Wide Linear outputs. This combines the generalization power of the deep network with the memorization capability of the wide linear model."
  },
  "softmax": {
    title: "Softmax Output",
    description: "Applies the Softmax function to the combined logits to produce a probability distribution over the N classes."
  },

  // Model 2 Details (Updated to match flowchart)
  "m2-input": { title: "Input features", description: "Raw input features." },
  "m2-norm": { title: "Normalization", description: "Standardizes input features." },
  "m2-stem": { title: "Dense stem", description: "Initial dense layer processing." },
  "m2-stem-gelu": { title: "GELU", description: "GELU Activation." },
  "m2-stem-bn": { title: "Batch Norm", description: "Batch Normalization." },
  "m2-stem-drop": { title: "Dropout", description: "Dropout layer." },

  // Block 1
  "m2-rb1-short": { title: "Dense (128)", description: "Shortcut path projection." },
  "m2-rb1-dense": { title: "Dense (128)", description: "Residual path dense layer." },
  "m2-rb1-gelu": { title: "GELU", description: "Activation function." },
  "m2-rb1-bn": { title: "Batch Norm", description: "Batch Normalization." },
  "m2-rb1-drop": { title: "Dropout (0.2)", description: "Regularization." },
  "m2-rb1-add": { title: "Add (+)", description: "Element-wise addition." },
  "m2-rb1-relu": { title: "ReLU", description: "Rectified Linear Unit." },
  "m2-rb1-post-drop": { title: "Dropout (0.2)", description: "Post-activation dropout." },

  // Block 2
  "m2-rb2-short": { title: "Dense (64)", description: "Shortcut path projection." },
  "m2-rb2-dense": { title: "Dense (64)", description: "Residual path dense layer." },
  "m2-rb2-gelu": { title: "GELU", description: "Activation function." },
  "m2-rb2-bn": { title: "Batch Norm", description: "Batch Normalization." },
  "m2-rb2-drop": { title: "Dropout (0.2)", description: "Regularization." },
  "m2-rb2-add": { title: "Add (+)", description: "Element-wise addition." },

  "m2-output": { title: "Output (softmax)", description: "Final classification probabilities." }
};

const connections = {
  "model-1": [
    { from: "node-input", to: "node-dense1" },
    { from: "node-input", to: "node-wide-linear" },
    { from: "node-dense1", to: "node-se1" },
    { from: "node-se1", to: "node-dense2" },
    { from: "node-dense2", to: "node-se2" },
    { from: "node-se2", to: "node-dense3" },
    { from: "node-dense3", to: "node-se3" },
    { from: "node-se3", to: "node-deep-logits" },
    { from: "node-deep-logits", to: "node-add" },
    { from: "node-wide-linear", to: "node-add" },
    { from: "node-add", to: "node-softmax" }
  ],
  "model-2": [
    // Stem
    { from: "node-m2-input", to: "node-m2-norm" },
    { from: "node-m2-norm", to: "node-m2-stem" },
    { from: "node-m2-stem", to: "node-m2-stem-gelu" },
    { from: "node-m2-stem-gelu", to: "node-m2-stem-bn" },
    { from: "node-m2-stem-bn", to: "node-m2-stem-drop" },

    // Split 1
    { from: "node-m2-stem-drop", to: "node-m2-rb1-short", type: "split-left" },
    { from: "node-m2-stem-drop", to: "node-m2-rb1-dense", type: "split-right" },

    // Residual Path 1 Internal
    { from: "node-m2-rb1-dense", to: "node-m2-rb1-gelu" },
    { from: "node-m2-rb1-gelu", to: "node-m2-rb1-bn" },
    { from: "node-m2-rb1-bn", to: "node-m2-rb1-drop" },

    // Merge 1
    { from: "node-m2-rb1-short", to: "node-m2-rb1-add", type: "merge-left" },
    { from: "node-m2-rb1-drop", to: "node-m2-rb1-add", type: "merge-right" },

    // Post-Merge 1
    { from: "node-m2-rb1-add", to: "node-m2-rb1-relu" },
    { from: "node-m2-rb1-relu", to: "node-m2-rb1-post-drop" },

    // Split 2
    { from: "node-m2-rb1-post-drop", to: "node-m2-rb2-short", type: "split-left" },
    { from: "node-m2-rb1-post-drop", to: "node-m2-rb2-dense", type: "split-right" },

    // Residual Path 2 Internal
    { from: "node-m2-rb2-dense", to: "node-m2-rb2-gelu" },
    { from: "node-m2-rb2-gelu", to: "node-m2-rb2-bn" },
    { from: "node-m2-rb2-bn", to: "node-m2-rb2-drop" },

    // Merge 2
    { from: "node-m2-rb2-short", to: "node-m2-rb2-add", type: "merge-left" },
    { from: "node-m2-rb2-drop", to: "node-m2-rb2-add", type: "merge-right" },

    // Output
    { from: "node-m2-rb2-add", to: "node-m2-output" }
  ]
};

let activeModel = "model-1";

function drawConnections() {
  const svg = document.getElementById('connections');
  svg.innerHTML = ''; // Clear existing lines

  // Use content-wrapper as the reference frame
  const containerRect = document.getElementById('content-wrapper').getBoundingClientRect();

  const activeConnections = connections[activeModel] || [];

  activeConnections.forEach(conn => {
    const fromNode = document.getElementById(conn.from);
    const toNode = document.getElementById(conn.to);

    // Only draw if both nodes are visible (part of active model)
    if (fromNode && toNode && fromNode.offsetParent !== null && toNode.offsetParent !== null) {
      const fromRect = fromNode.getBoundingClientRect();
      const toRect = toNode.getBoundingClientRect();

      // Calculate center points relative to the wrapper
      // For split/merge, we might want to connect to specific sides, but center-to-center usually works if we curve right
      let x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
      let y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
      let x2 = toRect.left + toRect.width / 2 - containerRect.left;
      let y2 = toRect.top + toRect.height / 2 - containerRect.top;

      // Adjust start/end points for vertical layout to look cleaner (bottom to top)
      if (activeModel === 'model-2') {
        y1 = fromRect.bottom - containerRect.top;
        y2 = toRect.top - containerRect.top;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      let d;

      if (conn.type === 'split-left' || conn.type === 'merge-left') {
        // Curve out to left
        const controlY = (y2 - y1) / 2;
        d = `M ${x1} ${y1} C ${x1} ${y1 + controlY}, ${x2} ${y2 - controlY}, ${x2} ${y2}`;
      } else if (conn.type === 'split-right' || conn.type === 'merge-right') {
        // Curve out to right
        const controlY = (y2 - y1) / 2;
        d = `M ${x1} ${y1} C ${x1} ${y1 + controlY}, ${x2} ${y2 - controlY}, ${x2} ${y2}`;
      } else if (activeModel === 'model-2') {
        // Straight down or simple curve
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
      } else {
        // Default Model 1 Logic (Horizontal/Vertical mix)
        // Recalculate centers for Model 1 as it uses side-to-side often
        x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
        y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
        x2 = toRect.left + toRect.width / 2 - containerRect.left;
        y2 = toRect.top + toRect.height / 2 - containerRect.top;

        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        if (dx > dy) {
          const controlX = dx * 0.5;
          d = `M ${x1} ${y1} C ${x1 + controlX} ${y1}, ${x2 - controlX} ${y2}, ${x2} ${y2}`;
        } else {
          const controlY = dy * 0.5;
          d = `M ${x1} ${y1} C ${x1} ${y1 + controlY}, ${x2} ${y2 - controlY}, ${x2} ${y2}`;
        }
      }

      path.setAttribute('d', d);
      path.setAttribute('id', `path-${conn.from}-${conn.to}`);
      svg.appendChild(path);
    }
  });
}

function fitToScreen() {
  const wrapper = document.getElementById('content-wrapper');
  const container = document.querySelector('.visualizer-container');

  if (!wrapper || !container) return;

  // Reset scale to measure natural size
  wrapper.style.transform = 'none';

  // Redraw connections based on natural size
  drawConnections();

  const contentWidth = wrapper.offsetWidth;
  const contentHeight = wrapper.offsetHeight;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // Add some padding
  const padding = 40;
  const availableWidth = containerWidth - padding;
  const availableHeight = containerHeight - padding;

  const scaleX = availableWidth / contentWidth;
  const scaleY = availableHeight / contentHeight;

  // Use the smaller scale, cap at 1 to prevent upscaling blurriness (optional, remove cap if you want zoom)
  // Let's allow upscaling slightly if needed, but mostly downscaling
  let scale = Math.min(scaleX, scaleY);
  if (scale > 1.2) scale = 1.2; // Cap max scale

  // Apply scale
  wrapper.style.transform = `scale(${scale})`;
}

function showDetails(nodeId) {
  // Activate visual style
  const node = document.querySelector(`.node[data-id="${nodeId}"]`);
  if (node) node.classList.add('active');

  // Show details
  const detailPanel = document.getElementById('details-panel');
  const detailTitle = document.getElementById('detail-title');
  const detailContent = document.getElementById('detail-content');

  if (details[nodeId]) {
    detailTitle.textContent = details[nodeId].title;
    detailContent.textContent = details[nodeId].description;
    detailPanel.classList.remove('hidden');
  }
}

function hideDetails() {
  // Deactivate all
  document.querySelectorAll('.node').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('path').forEach(p => p.classList.remove('active'));

  // Hide details
  const detailPanel = document.getElementById('details-panel');
  detailPanel.classList.add('hidden');
}

function switchTab(targetId) {
  activeModel = targetId;

  // Update Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === targetId);
  });

  // Update Views
  document.querySelectorAll('.model-view').forEach(view => {
    view.classList.toggle('active', view.id === targetId);
    view.classList.toggle('hidden', view.id !== targetId);
  });

  // Redraw and Fit
  fitToScreen();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initial fit
  fitToScreen();

  // Handle Node Hovers
  document.querySelectorAll('.node').forEach(node => {
    node.addEventListener('mouseenter', () => {
      showDetails(node.dataset.id);
    });
    node.addEventListener('mouseleave', () => {
      hideDetails();
    });
  });

  // Handle Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.target);
    });
  });

  // Redraw/Refit on resize
  window.addEventListener('resize', () => {
    requestAnimationFrame(fitToScreen);
  });
});
