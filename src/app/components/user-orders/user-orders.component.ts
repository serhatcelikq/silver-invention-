// Siparişleri dinle
ngOnInit() {
  this.orderService.orders$.subscribe(orders => {
    // Sadece bu kullanıcıya ait siparişleri filtrele
    this.userOrders = orders.filter(order => order.userId === this.currentUserId);
  });
} 