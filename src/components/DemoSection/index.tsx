import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

export default function DemoSection(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className={clsx('col col--5')}>
            <div className={`text--center padding-horiz--md ${styles.demo}`}>
              <h1>Turn complexity into clarity.</h1>
              <p>
                Use <a href="docs/archdoc-ui">ArchDoc UI</a> to view and explore your organization's architecture.
              </p>
            </div>
          </div>
          <div className={clsx('col col--7')}>
            <div className="text--center">
              <img src='img/archdoc-demo.gif' />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
