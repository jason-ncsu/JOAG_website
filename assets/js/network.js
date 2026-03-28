window.NetworkView = (() => {
  const svg = () => document.getElementById("network-svg");
  const tooltip = () => document.getElementById("network-tooltip");

  const CLUSTER_COLORS = {
    Surveillance: "#77d7e6",
    "Network analysis": "#ff9f43",
    Sampling: "#5ab2ff",
    Modeling: "#be7cff",
    Prevention: "#8dd9b5",
    Technology: "#f26ab8",
    Microbiology: "#ffd166"
  };

  let state = {
    selectedId: 1,
    nodeMap: new Map(),
    listenersBound: false,
    edgeEls: [],
    nodeEls: []
  };

  function getNodes() {
    return window.PAPER_DATA.papers.map((paper, index) => {
      const angle = (Math.PI * 2 * index) / window.PAPER_DATA.papers.length;
      const radius = 180 + (index % 4) * 28;
      return {
        ...paper,
        x: 450 + Math.cos(angle) * radius + (index % 3) * 16,
        y: 290 + Math.sin(angle) * radius + (index % 5) * 10,
        vx: 0,
        vy: 0,
        r: 12
      };
    });
  }

  function getLinks(nodes) {
    const byId = new Map(nodes.map(node => [node.id, node]));
    return window.PAPER_DATA.links.map(link => ({
      ...link,
      source: byId.get(link.source),
      target: byId.get(link.target)
    }));
  }

  function simulate(nodes, links, iterations = 260) {
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy + 0.01;
          const force = 1800 / distSq;
          const dist = Math.sqrt(distSq);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }

      links.forEach(link => {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 120 - link.weight * 10;
        const spring = (dist - targetDist) * 0.0045;
        const fx = (dx / dist) * spring;
        const fy = (dy / dist) * spring;
        link.source.vx += fx;
        link.source.vy += fy;
        link.target.vx -= fx;
        link.target.vy -= fy;
      });

      nodes.forEach(node => {
        const centerDx = 450 - node.x;
        const centerDy = 290 - node.y;
        node.vx += centerDx * 0.0009;
        node.vy += centerDy * 0.0009;
        node.vx *= 0.88;
        node.vy *= 0.88;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(70, Math.min(830, node.x));
        node.y = Math.max(60, Math.min(520, node.y));
      });
    }
  }

  function line(x1, y1, x2, y2, className) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "line");
    el.setAttribute("x1", x1);
    el.setAttribute("y1", y1);
    el.setAttribute("x2", x2);
    el.setAttribute("y2", y2);
    el.setAttribute("class", className);
    return el;
  }

  function circle(cx, cy, r, fill, className) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    el.setAttribute("cx", cx);
    el.setAttribute("cy", cy);
    el.setAttribute("r", r);
    el.setAttribute("fill", fill);
    el.setAttribute("class", className);
    return el;
  }

  function text(x, y, value, className) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("class", className);
    el.textContent = value;
    return el;
  }

  function drawLegend(svgEl) {
    const legendItems = Object.entries(CLUSTER_COLORS);
    const legendGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    legendGroup.setAttribute("class", "network-legend");
    legendGroup.setAttribute("transform", "translate(22, 20)");

    const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    background.setAttribute("x", 0);
    background.setAttribute("y", 0);
    background.setAttribute("width", 198);
    background.setAttribute("height", 26 + legendItems.length * 28);
    background.setAttribute("rx", 16);
    background.setAttribute("class", "network-legend-box");
    legendGroup.appendChild(background);

    const title = text(16, 24, "Clusters", "network-legend-title");
    legendGroup.appendChild(title);

    legendItems.forEach(([cluster, color], index) => {
      const y = 48 + index * 28;
      legendGroup.appendChild(circle(18, y - 4, 6, color, "network-legend-dot"));
      legendGroup.appendChild(text(34, y, cluster, "network-legend-label"));
    });

    svgEl.appendChild(legendGroup);
  }

  function draw(selectedId = 1) {
    state.selectedId = selectedId;
    const svgEl = svg();
    svgEl.innerHTML = `
      <defs>
        <radialGradient id="networkGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="rgba(86, 191, 255, 0.24)" />
          <stop offset="100%" stop-color="rgba(8, 20, 48, 0)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="900" height="580" fill="transparent"></rect>
      <ellipse cx="450" cy="290" rx="330" ry="225" fill="url(#networkGlow)"></ellipse>
    `;

    const nodes = getNodes();
    const links = getLinks(nodes);
    simulate(nodes, links);
    state.nodeMap = new Map(nodes.map(node => [node.id, node]));
    state.edgeEls = [];
    state.nodeEls = [];

    links.forEach(link => {
      const edge = line(link.source.x, link.source.y, link.target.x, link.target.y, "network-edge");
      edge.dataset.source = String(link.source.id);
      edge.dataset.target = String(link.target.id);
      edge.dataset.weight = String(link.weight);
      svgEl.appendChild(edge);
      state.edgeEls.push(edge);
    });

    nodes.forEach(node => {
      const color = CLUSTER_COLORS[node.cluster] || "#bfcfff";
      const glow = circle(node.x, node.y, node.r + 10, color, "network-node-glow");
      glow.style.opacity = node.id === selectedId ? "0.32" : "0.16";
      const point = circle(node.x, node.y, node.r + (node.id === selectedId ? 4 : 0), color, "network-node");
      point.dataset.id = String(node.id);
      point.dataset.title = node.title;
      point.dataset.cluster = node.cluster;
      if (node.id === selectedId) point.classList.add("is-selected");
      svgEl.appendChild(glow);
      svgEl.appendChild(point);
      state.nodeEls.push({ node, glow, point });
    });

    drawLegend(svgEl);
    bindEvents();
    highlightSelection(selectedId);
  }

  function bindEvents() {
    if (state.listenersBound) return;
    const svgEl = svg();

    svgEl.addEventListener("mousemove", event => {
      const target = event.target;
      if (!(target instanceof SVGCircleElement) || !target.classList.contains("network-node")) {
        hideTooltip();
        return;
      }
      showTooltip(event, target.dataset.title || "Paper");
    });

    svgEl.addEventListener("mouseleave", hideTooltip);

    svgEl.addEventListener("click", event => {
      const target = event.target;
      if (!(target instanceof SVGCircleElement) || !target.classList.contains("network-node")) return;
      const id = Number(target.dataset.id);
      if (!Number.isNaN(id)) {
        document.dispatchEvent(new CustomEvent("paper:selected", { detail: { id } }));
      }
    });

    state.listenersBound = true;
  }

  function showTooltip(event, text) {
    const tip = tooltip();
    tip.textContent = text;
    tip.style.left = `${event.offsetX + 18}px`;
    tip.style.top = `${event.offsetY + 18}px`;
    tip.setAttribute("aria-hidden", "false");
    tip.classList.add("is-visible");
  }

  function hideTooltip() {
    const tip = tooltip();
    tip.classList.remove("is-visible");
    tip.setAttribute("aria-hidden", "true");
  }

  function highlightSelection(selectedId) {
    const connected = new Set([selectedId]);
    state.edgeEls.forEach(edge => {
      const s = Number(edge.dataset.source);
      const t = Number(edge.dataset.target);
      const isConnected = s === selectedId || t === selectedId;
      if (isConnected) {
        connected.add(s);
        connected.add(t);
      }
      edge.classList.toggle("is-active", isConnected);
      edge.classList.toggle("is-muted", !isConnected);
    });

    state.nodeEls.forEach(({ node, glow, point }) => {
      const active = connected.has(node.id);
      point.classList.toggle("is-selected", node.id === selectedId);
      point.classList.toggle("is-muted", !active);
      glow.style.opacity = node.id === selectedId ? "0.34" : active ? "0.18" : "0.06";
      point.setAttribute("r", String(node.r + (node.id === selectedId ? 4 : 0)));
    });
  }

  return { draw, highlightSelection };
})();
