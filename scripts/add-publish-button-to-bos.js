const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('..', 'PrintXO - BOS', 'src', 'app', '(dashboard)', 'products', 'page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add Globe, Check, ExternalLink to imports
if (!content.includes('Globe,')) {
  content = content.replace(
    'Trash2,\n} from \'lucide-react\';',
    'Trash2,\n  Globe,\n  Check,\n  ExternalLink,\n} from \'lucide-react\';'
  );
}

// 2. Add state and publish handler inside ProductsCataloguePage
if (!content.includes('handlePublishToWebsite')) {
  const stateInsertTarget = 'const [categoryFilter, setCategoryFilter] = useState(\'ALL\');';
  const stateAndHandlerCode = `const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [publishingSku, setPublishingSku] = useState<string | null>(null);
  const [publishedSkus, setPublishedSkus] = useState<Set<string>>(new Set());

  // Fetch already published products from Website storefront
  useEffect(() => {
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    fetch(\`\${websiteUrl}/api/sync/product\`)
      .then((r) => r.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setPublishedSkus(new Set(data.products.map((p: any) => p.sku)));
        }
      })
      .catch(() => {});
  }, []);

  const handlePublishToWebsite = async (product: any) => {
    setPublishingSku(product.sku);
    try {
      const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
      const res = await fetch(\`\${websiteUrl}/api/sync/product\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          sku: product.sku,
          description: product.description || \`Industrial precision 3D manufactured component in \${product.materialName || 'PLA+'}. Dimensionally verified.\`,
          price: product.sellingPrice || 999,
          costPrice: product.productionCost || 250,
          category: product.category || 'Engineering Parts',
          material: product.materialName || 'PLA+',
          standardPrintTimeHours: product.standardPrintTimeHours,
          isFeatured: true,
        }),
      });

      if (res.ok) {
        setPublishedSkus((prev) => new Set([...Array.from(prev), product.sku]));
        alert(\`✓ "\${product.name}" (\${product.sku}) published live to PrintX Studio storefront!\`);
      } else {
        alert('Failed to publish product to storefront.');
      }
    } catch (e: any) {
      alert('Error connecting to storefront: ' + e.message);
    } finally {
      setPublishingSku(null);
    }
  };`;

  content = content.replace(stateInsertTarget, stateAndHandlerCode);
}

// 3. Update actions column with 1-Click Publish button
const oldActionsBlock = `    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link
            href={\`/products/\${item.id}\`}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11, padding: '4px 8px' }}
            title="Specs & CAD"
          >
            Specs <ArrowRight size={11} />
          </Link>
          <button
            onClick={() => handleOpenEditProduct(item)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', color: 'var(--text-secondary)' }}
            title="Edit Product"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDeleteProduct(item.id, item.name)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 6px', color: 'var(--accent-red)' }}
            title="Delete Product"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
      width: '180px',
    },`;

const newActionsBlock = `    {
      key: 'actions',
      header: 'Actions & Store Sync',
      render: (item) => {
        const isPublished = publishedSkus.has(item.sku);
        const isPublishing = publishingSku === item.sku;
        const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => handlePublishToWebsite(item)}
              disabled={isPublishing}
              className="btn btn-sm"
              style={{
                backgroundColor: isPublished ? 'rgba(34, 197, 94, 0.12)' : 'rgba(220, 38, 38, 0.15)',
                color: isPublished ? '#22c55e' : 'var(--accent-red)',
                border: \`1px solid \${isPublished ? 'rgba(34, 197, 94, 0.4)' : 'rgba(220, 38, 38, 0.35)'}\`,
                fontSize: 11,
                padding: '4px 8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
                cursor: isPublishing ? 'wait' : 'pointer',
              }}
              title="1-Click Publish or Re-sync to Website Catalog"
            >
              <Globe size={11} />
              <span>{isPublishing ? 'Publishing...' : isPublished ? 'Live on Store ✓' : 'Publish to Store'}</span>
            </button>

            {isPublished && (
              <a
                href={\`\${websiteUrl}/products\`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 11, padding: '4px 6px', color: 'var(--text-secondary)' }}
                title="View on Website Storefront"
              >
                <ExternalLink size={11} />
              </a>
            )}

            <Link
              href={\`/products/\${item.id}\`}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11, padding: '4px 7px' }}
              title="Specs & CAD"
            >
              Specs
            </Link>
            <button
              onClick={() => handleOpenEditProduct(item)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 6px', color: 'var(--text-secondary)' }}
              title="Edit Product"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => handleDeleteProduct(item.id, item.name)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 6px', color: 'var(--accent-red)' }}
              title="Delete Product"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      },
      width: '280px',
    },`;

content = content.replace(oldActionsBlock, newActionsBlock);
fs.writeFileSync(targetFile, content, 'utf8');
console.log('✓ Successfully added 1-click Publish to Website in BOS products page');
