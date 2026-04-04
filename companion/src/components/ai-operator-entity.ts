// SitePulse V3 — AI Operator Entity Component
// 3D visual representation of AI consciousness state

import type { AIConsciousnessState } from '../core/types.js';
import { AI_STATE_CONFIGS, type AIStateConfig } from '../core/ai-consciousness-machine.js';
import { eventBus } from '../core/event-bus.js';

export interface AIEntityOptions {
  container: HTMLElement;
  size?: 'default' | 'compact' | 'large';
  showStatus?: boolean;
  variant?: 'orb' | 'cube';
}

export class AIOperatorEntity {
  private _container: HTMLElement;
  private _entityEl: HTMLElement;
  private _coreEl: HTMLElement;
  private _orbitEl: HTMLElement;
  private _particlesEl: HTMLElement;
  private _statusEl?: HTMLElement;
  private _backdropEl: HTMLElement;
  private _currentState: AIConsciousnessState = 'DORMANT';
  private _unsubscribe?: () => void;

  constructor(options: AIEntityOptions) {
    this._container = options.container;
    this._container.classList.add('ai-entity-container');
    
    if (options.size) {
      this._container.classList.add(`ai-entity-${options.size}`);
    }

    this._buildDOM(options);
    this._applyState('DORMANT');
    this._listenToEvents();
  }

  private _buildDOM(options: AIEntityOptions): void {
    // Backdrop glow
    this._backdropEl = document.createElement('div');
    this._backdropEl.className = 'ai-entity-backdrop';
    this._container.appendChild(this._backdropEl);

    // Orbital ring
    this._orbitEl = document.createElement('div');
    this._orbitEl.className = 'ai-entity-orbit';
    this._container.appendChild(this._orbitEl);

    // Particles
    this._particlesEl = document.createElement('div');
    this._particlesEl.className = 'ai-entity-particles';
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'ai-particle';
      this._particlesEl.appendChild(particle);
    }
    this._container.appendChild(this._particlesEl);

    // Core
    this._coreEl = document.createElement('div');
    this._coreEl.className = 'ai-entity-core';
    this._container.appendChild(this._coreEl);

    // Optional 3D cube variant
    if (options.variant === 'cube') {
      const cube = document.createElement('div');
      cube.className = 'ai-entity-cube';
      for (let i = 0; i < 6; i++) {
        const face = document.createElement('div');
        face.className = 'ai-cube-face';
        cube.appendChild(face);
      }
      this._coreEl.appendChild(cube);
    }

    // Status label
    if (options.showStatus !== false) {
      this._statusEl = document.createElement('div');
      this._statusEl.className = 'ai-entity-status';
      this._container.appendChild(this._statusEl);
    }

    this._entityEl = this._container;
  }

  private _listenToEvents(): void {
    this._unsubscribe = eventBus.on('AI_STATE_CHANGED', (event) => {
      const payload = event.payload as { 
        to?: AIConsciousnessState; 
        state?: AIConsciousnessState;
      };
      const newState = payload.to ?? payload.state ?? 'DORMANT';
      this._applyState(newState);
    });
  }

  private _applyState(state: AIConsciousnessState): void {
    if (this._currentState === state) return;
    
    this._currentState = state;
    const config = AI_STATE_CONFIGS[state];

    // Update CSS custom properties
    this._entityEl.style.setProperty('--ai-color', config.color);
    this._entityEl.style.setProperty('--ai-breathing-duration', `${config.breathingDurationMs}ms`);
    this._entityEl.style.setProperty('--ai-particle-opacity', String(config.glowIntensity));

    // Update animation class
    this._entityEl.className = this._entityEl.className.replace(/ai-state--\w+/g, '');
    this._entityEl.classList.add(config.animationClass);

    // Update status text
    if (this._statusEl) {
      this._statusEl.textContent = config.label;
    }

    console.log(`[AIOperatorEntity] State changed to ${state}: ${config.description}`);
  }

  setState(state: AIConsciousnessState): void {
    this._applyState(state);
  }

  get currentState(): AIConsciousnessState {
    return this._currentState;
  }

  get config(): AIStateConfig {
    return AI_STATE_CONFIGS[this._currentState];
  }

  pulse(): void {
    this._coreEl.animate([
      { transform: 'scale(1)', opacity: 0.8 },
      { transform: 'scale(1.3)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0.8 }
    ], {
      duration: 600,
      easing: 'ease-out'
    });
  }

  destroy(): void {
    this._unsubscribe?.();
    this._container.innerHTML = '';
    this._container.classList.remove('ai-entity-container', 'ai-entity-compact', 'ai-entity-large');
  }
}

// Factory function for easy instantiation
export function createAIOperatorEntity(options: AIEntityOptions): AIOperatorEntity {
  return new AIOperatorEntity(options);
}
