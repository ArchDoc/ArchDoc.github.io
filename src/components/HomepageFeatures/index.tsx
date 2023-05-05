import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

import IntuitiveDiagramSVG from '@site/static/img/1.svg';
import EasyToUseSVG from '@site/static/img/2.svg';
import EmbeddedDocumentationSVG from '@site/static/img/3.svg';

import DocusaurusSvg from './docusaurus.svg';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Intuitive Diagrams',
    Svg: IntuitiveDiagramSVG,
    description: (
      <>
        ArchDoc arranges your organization's architecture in a clear, easy-to-understand graph.
      </>
    ),
  },
  {
    title: 'Easy to Use',
    Svg: EasyToUseSVG,
    description: (
      <>
        No need to learn a new diagram-as-code DSL, simply create a YAML 
        file and use the <code>archdoc</code> cli tool to visualize it.
      </>
    ),
  },
  {
    title: 'Embedded Documentation',
    Svg: EmbeddedDocumentationSVG,
    description: (
      <>
        Define and read documentation for your services, while 
        exploring your architecture.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.features} role='img' />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
