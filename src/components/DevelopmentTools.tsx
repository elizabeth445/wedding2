import { Component, useSyncExternalStore, type ReactNode } from 'react';
import { Agentation } from 'agentation';

const desktopQuery = '(min-width: 768px)';
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const getSnapshot = () => window.matchMedia(desktopQuery).matches;

// Native modal dialogs make everything outside them inert, including a body portal.
// Move the single toolbar into the active dialog so it shares its focus boundary.
const subscribeToModal = (notify: () => void) => {
  const observer = new MutationObserver((records) => {
    if (
      records.some(
        (record) =>
          (record.type === 'attributes' && record.target instanceof HTMLDialogElement) ||
          [...record.addedNodes, ...record.removedNodes].some(
            (node) =>
              node instanceof Element && (node.matches('dialog') || node.querySelector('dialog')),
          ),
      )
    ) {
      notify();
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['open'],
  });
  return () => observer.disconnect();
};
const getModal = () =>
  [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].at(-1) ?? null;

// A development tool must not take down the invitation if browser storage is blocked.
class DevelopmentToolsBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function DevelopmentTools() {
  const desktop = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const modal = useSyncExternalStore(subscribeToModal, getModal, () => null);
  return desktop ? (
    <DevelopmentToolsBoundary>
      <Agentation portalContainer={modal} />
    </DevelopmentToolsBoundary>
  ) : null;
}
