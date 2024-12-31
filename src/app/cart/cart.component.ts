completeOrder() {
  this.authService.user$.pipe(take(1)).subscribe(user => {
    if (!user) {
      this.notificationService.showError('Lütfen önce giriş yapın');
      return;
    }

    const orderData = {
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Misafir',
      restaurantId: this.restaurant.id,
      restaurantName: this.restaurant.name,
      items: this.cartItems.map(item => ({
        ...item,
        quantity: item.quantity || 1
      })),
      totalAmount: this.calculateTotal(),
      status: 'Beklemede' as const,
      orderDate: new Date().toISOString()
    };

    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Siparişiniz başarıyla oluşturuldu');
        this.clearCart();
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('Sipariş oluşturulurken hata:', error);
        this.notificationService.showError('Sipariş oluşturulurken bir hata oluştu');
      }
    });
  });
} 