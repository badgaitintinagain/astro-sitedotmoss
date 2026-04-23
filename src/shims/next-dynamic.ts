import React from 'react';

type Loader<T> = () => Promise<{ default: T }>;

export default function dynamic<T extends React.ComponentType<any>>(loader: Loader<T>) {
  const DynamicComponent = React.lazy(loader);

  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={null}>
      <DynamicComponent {...props} />
    </React.Suspense>
  );
}
