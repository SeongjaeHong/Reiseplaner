import { DecoratorNode, type NodeKey, type Spread, type SerializedLexicalNode } from 'lexical';
import ImageComponent from './ImageComponent';
import { isBase64DataUrl } from '../../utils/image';
import { getImageURL } from '@/apis/supabase/buckets';

type SerializedImageNode = Spread<
  {
    type: 'file';
    src: string;
    width: number;
    height: number;
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __width: number;
  __height: number;

  static getType(): string {
    return 'file';
  }
  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__width, node.__height, node.__key);
  }

  constructor(src: string, width = 300, height = 200, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__width = width;
    this.__height = height;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return new ImageNode(serializedNode.src, serializedNode.width, serializedNode.height);
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'file',
      src: this.__src,
      width: this.__width,
      height: this.__height,
      version: 1,
    };
  }

  decorate(): React.ReactNode {
    let imgSrc: string;
    if (isBase64DataUrl(this.__src)) {
      imgSrc = this.__src;
    } else {
      imgSrc = getImageURL(this.__src);
    }

    return (
      <ImageComponent
        src={imgSrc}
        width={this.__width}
        height={this.__height}
        nodeKey={this.__key}
      />
    );
  }

  createDOM(): HTMLElement {
    const fig = document.createElement('figure');
    fig.style.position = 'inline-block';
    return fig;
  }
  updateDOM(): false {
    return false;
  }

  setSize(width: number, height: number) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }
}

export function $createImageNode(src: string, width = 300, height = 200): ImageNode {
  return new ImageNode(src, width, height);
}
