"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cartStore";

/**
 * Renders a portal-level "shooting star" animation:
 * a product image flies from where the user clicked
 * to the cart icon in the top-right navbar.
 *
 * Mount this once in the root layout, next to <CartDrawer />.
 */
export function FlyingCartItem() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const flyQueue = useCartStore((s) => s.flyQueue);
  const consumeFly = useCartStore((s) => s.consumeFly);

  useEffect(() => {
    if (!flyQueue.length) return;
    const fly = flyQueue[0];
    consumeFly();

    // Find the cart icon in the navbar (data-cart-icon attribute)
    const cartIcon = document.querySelector("[data-cart-icon]") as HTMLElement | null;
    if (!cartIcon) return;

    const iconRect = cartIcon.getBoundingClientRect();
    const targetX = iconRect.left + iconRect.width / 2;
    const targetY = iconRect.top + iconRect.height / 2;

    // Create the flying element
    const el = document.createElement("div");
    el.style.cssText = `
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      border-radius: 50%;
      overflow: hidden;
      width: 56px;
      height: 56px;
      left: ${fly.fromX - 28}px;
      top: ${fly.fromY - 28}px;
      border: 2px solid #C9A961;
      box-shadow: 0 0 20px rgba(201,169,97,0.6), 0 0 40px rgba(201,169,97,0.3);
      transform: scale(1);
      opacity: 1;
      transition: none;
      will-change: transform, opacity, left, top;
    `;

    if (fly.image) {
      const img = document.createElement("img");
      img.src = fly.image;
      img.style.cssText = "width:100%;height:100%;object-fit:cover;";
      el.appendChild(img);
    } else {
      // Gold circle fallback
      el.style.background = "radial-gradient(circle, #C9A961 30%, #2A0A12 100%)";
    }

    document.body.appendChild(el);

    // Animate via RAF for smooth arc trajectory
    const startX = fly.fromX - 28;
    const startY = fly.fromY - 28;
    const endX = targetX - 28;
    const endY = targetY - 28;

    const duration = 700; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-in-out cubic
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Arc: lift up in a parabola
      const arcHeight = Math.min(Math.abs(endY - startY), 150) * 0.6;
      const arcY = -arcHeight * Math.sin(eased * Math.PI);

      const currentX = startX + (endX - startX) * eased;
      const currentY = startY + (endY - startY) * eased + arcY;
      const scale = 1 - eased * 0.65;
      const opacity = progress > 0.75 ? 1 - (progress - 0.75) / 0.25 : 1;

      el.style.left = `${currentX}px`;
      el.style.top = `${currentY}px`;
      el.style.transform = `scale(${scale})`;
      el.style.opacity = `${opacity}`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Pulse the cart icon
        cartIcon.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.35)" },
            { transform: "scale(1)" },
          ],
          { duration: 350, easing: "ease-out" }
        );
        el.remove();
      }
    };

    requestAnimationFrame(animate);
  }, [flyQueue, consumeFly]);

  return <div ref={canvasRef} aria-hidden="true" />;
}
