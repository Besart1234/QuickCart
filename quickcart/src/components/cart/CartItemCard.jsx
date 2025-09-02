const IMG_URL = 'https://localhost:7000';

function CartItemCard({ item, onIncrease, onDecrease, onRemove }) {
    return (
        <div className="card mb-3 shadow-sm">
            <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div
                        style={{
                            width: '100px',
                            height: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '0.5rem',
                            flexShrink: 0
                        }}
                    >
                        <img 
                            src={`${IMG_URL}${item.imageUrl}`} 
                            alt={`${item.name}`}
                            className="rounded"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'conver',
                                display: 'block'
                            }} 
                        />
                    </div>
                    <div>
                        <h5 className="card-title mb-1">{item.productName}</h5>
                        <p className="card-text text-muted mb-0">${item.currentPrice.toFixed(2)}</p>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <button 
                        disabled={item.quantity === 1} 
                        type="button" 
                        onClick={() => onDecrease(item.productId)}
                        className="btn btn-outline-secondary btn-sm"
                    >
                        -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                        disabled={item.quantity >= item.stock}
                        type="button"
                        onClick={() => onIncrease(item.productId)}
                        className="btn btn-outline-secondary btn-sm"
                    >
                        +
                    </button>
                </div>

                <div className="text-end">
                    <p className="fw-semibold mb-1">${(item.currentPrice * item.quantity).toFixed(2)}</p>
                    <button className="btn btn-link text-danger p-0 small" type="button" onClick={() => onRemove(item.productId)}>Remove</button>
                </div>
            </div>
        </div>
    );
}

export default CartItemCard;