const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const nav = document.querySelector('[data-nav]');
const canvas = document.querySelector('[data-crystal-canvas]');

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menu.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}));

const context = canvas.getContext('2d');
let width = 0;
let height = 0;
let ratio = 1;
let frame = 0;
let points = [];

const colors = ['#f2a541', '#b8e3d5', '#c73e68', '#3454d1'];

function buildCrystal() {
  const columns = width < 700 ? 7 : 12;
  const rows = width < 700 ? 11 : 9;
  const spacingX = width / (columns + 1);
  const spacingY = height / (rows + 1);

  points = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      points.push({
        row,
        column,
        baseX: spacingX * (column + 1) + (row % 2 ? spacingX * .38 : 0),
        baseY: spacingY * (row + 1),
        phase: Math.random() * Math.PI * 2,
        color: colors[(row + column) % colors.length]
      });
    }
  }
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  buildCrystal();
}

function position(point) {
  const drift = Math.sin(frame * .006 + point.phase);
  return {
    x: point.baseX + drift * 5,
    y: point.baseY + Math.cos(frame * .004 + point.phase) * 4
  };
}

function drawCrystal(animate = true) {
  context.clearRect(0, 0, width, height);
  context.save();
  context.globalAlpha = .26;

  points.forEach((point, index) => {
    const current = position(point);
    const right = points.find((candidate) => candidate.row === point.row && candidate.column === point.column + 1);
    const down = points.find((candidate) => candidate.row === point.row + 1 && candidate.column === point.column);

    [right, down].forEach((neighbor) => {
      if (!neighbor) return;
      const next = position(neighbor);
      context.beginPath();
      context.moveTo(current.x, current.y);
      context.lineTo(next.x, next.y);
      context.strokeStyle = '#ffffff';
      context.lineWidth = .7;
      context.stroke();
    });

    const pulse = 1 + Math.sin(frame * .01 + point.phase) * .18;
    context.beginPath();
    context.arc(current.x, current.y, (index % 7 === 0 ? 4.2 : 2.2) * pulse, 0, Math.PI * 2);
    context.fillStyle = point.color;
    context.globalAlpha = index % 7 === 0 ? .72 : .45;
    context.fill();
    context.globalAlpha = .26;
  });

  context.restore();
  frame += 1;
  if (animate) requestAnimationFrame(() => drawCrystal(true));
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawCrystal(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
