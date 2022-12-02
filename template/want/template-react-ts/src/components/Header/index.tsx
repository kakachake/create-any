import styles from './index.module.scss';
import { devDependencies } from '../../../package.json';
import logoSrc from '@assets/react.svg';
import { ReactComponent as ReactLogo } from '@assets/react.svg';
import Worker from '../../webWorker/example.js?worker';
import juejinLogo from '@assets/juejin.png';
import big from '@assets/big.jpg';

export function Header() {
  // 1. 初始化 Worker 实例
  const worker = new Worker();
  // 2. 主线程监听 worker 的信息
  worker.addEventListener('message', () => {
    // console.log(e);
  });
  return (
    <>
      <ReactLogo />
      <p className={styles.header}>This is Header</p>
      <div className="p-20px text-center">
        <h1 className="font-bold text-2xl mb-2">
          vite version: {devDependencies.vite}
        </h1>
        <button>111</button>
        <div className="flex-c">111</div>{' '}
        <img className="m-auto mb-4" src={logoSrc} alt="" />
        <img src={juejinLogo} alt="" />
        <img src={big} alt="" />
      </div>
    </>
  );
}
