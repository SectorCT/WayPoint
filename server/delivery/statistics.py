from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Package, Truck, RouteAssignment, DeliveryHistory
from authentication.models import User


class StatisticsView(APIView):
    """
    Get comprehensive statistics for the dashboard
    """
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        try:
            # Initialize default values
            package_stats = {
                'total_packages': 0,
                'pending_packages': 0,
                'in_transit_packages': 0,
                'delivered_packages': 0,
                'undelivered_packages': 0
            }
            
            truck_stats = {
                'total_trucks': 0,
                'used_trucks': 0,
                'available_trucks': 0
            }
            
            truck_usage_data = []
            daily_deliveries = []
            recent_activity = []
            
            # Try to get package stats
            try:
                package_stats = Package.objects.aggregate(
                    total_packages=Count('id'),
                    pending_packages=Count('id', filter=Q(status='pending')),
                    in_transit_packages=Count('id', filter=Q(status='in_transit')),
                    delivered_packages=Count('id', filter=Q(status='delivered')),
                    undelivered_packages=Count('id', filter=Q(status='undelivered'))
                )
            except Exception as e:
                print(f"Error getting package stats: {e}")
            
            # Try to get truck stats
            try:
                truck_stats = Truck.objects.aggregate(
                    total_trucks=Count('id'),
                    used_trucks=Count('id', filter=Q(isUsed=True)),
                    available_trucks=Count('id', filter=Q(isUsed=False))
                )
            except Exception as e:
                print(f"Error getting truck stats: {e}")

            # Try to get truck usage details
            try:
                trucks = Truck.objects.all()
                for truck in trucks:
                    try:
                        active_routes = RouteAssignment.objects.filter(
                            truck=truck,
                            isActive=True
                        )
                        
                        total_packages = 0
                        for route in active_routes:
                            if route.packageSequence:
                                total_packages += len(route.packageSequence)
                        
                        truck_usage_data.append({
                            'truck': truck.licensePlate,
                            'used': total_packages,
                            'capacity': float(truck.kilogramCapacity),
                            'isUsed': truck.isUsed
                        })
                    except Exception as e:
                        print(f"Error processing truck {truck.licensePlate}: {e}")
                        truck_usage_data.append({
                            'truck': truck.licensePlate,
                            'used': 0,
                            'capacity': float(truck.kilogramCapacity),
                            'isUsed': truck.isUsed
                        })
            except Exception as e:
                print(f"Error getting truck usage data: {e}")

            # Try to get daily deliveries
            try:
                today = timezone.now().date()
                for i in range(7):
                    date = today - timedelta(days=i)
                    day_name = date.strftime('%a')
                    
                    delivered_count = Package.objects.filter(
                        deliveryDate=date,
                        status='delivered'
                    ).count()
                    
                    daily_deliveries.append({
                        'day': day_name,
                        'value': delivered_count,
                        'date': date.isoformat()
                    })
                
                daily_deliveries.reverse()
            except Exception as e:
                print(f"Error getting daily deliveries: {e}")
                # Provide default data
                daily_deliveries = [
                    {'day': 'Mon', 'value': 0, 'date': ''},
                    {'day': 'Tue', 'value': 0, 'date': ''},
                    {'day': 'Wed', 'value': 0, 'date': ''},
                    {'day': 'Thu', 'value': 0, 'date': ''},
                    {'day': 'Fri', 'value': 0, 'date': ''},
                    {'day': 'Sat', 'value': 0, 'date': ''},
                    {'day': 'Sun', 'value': 0, 'date': ''}
                ]

            # Try to get additional statistics
            try:
                active_routes = RouteAssignment.objects.filter(isActive=True).count()
                total_drivers = User.objects.filter(isManager=False).count()
                verified_drivers = User.objects.filter(isManager=False, verified=True).count()
                unverified_drivers = total_drivers - verified_drivers
            except Exception as e:
                print(f"Error getting additional stats: {e}")
                active_routes = 0
                total_drivers = 0
                verified_drivers = 0
                unverified_drivers = 0

            # Try to get recent activity
            try:
                recent_packages = Package.objects.order_by('-id')[:10]
                for package in recent_packages:
                    if package.status == 'delivered':
                        activity_text = f"Package delivered to {package.recipient}"
                        activity_type = "delivery"
                    elif package.status == 'in_transit':
                        activity_text = f"Package in transit to {package.recipient}"
                        activity_type = "transit"
                    elif package.status == 'pending':
                        activity_text = f"Package pending for {package.recipient}"
                        activity_type = "pending"
                    else:
                        activity_text = f"Package {package.status} for {package.recipient}"
                        activity_type = "other"
                    
                    recent_activity.append({
                        'text': activity_text,
                        'type': activity_type,
                        'time': package.deliveryDate.isoformat() if package.deliveryDate else None
                    })
            except Exception as e:
                print(f"Error getting recent activity: {e}")

            response_data = {
                'package_stats': {
                    'total': package_stats.get('total_packages', 0) or 0,
                    'pending': package_stats.get('pending_packages', 0) or 0,
                    'in_transit': package_stats.get('in_transit_packages', 0) or 0,
                    'delivered': package_stats.get('delivered_packages', 0) or 0,
                    'undelivered': package_stats.get('undelivered_packages', 0) or 0
                },
                'truck_stats': {
                    'total': truck_stats.get('total_trucks', 0) or 0,
                    'used': truck_stats.get('used_trucks', 0) or 0,
                    'available': truck_stats.get('available_trucks', 0) or 0
                },
                'truck_usage_data': truck_usage_data,
                'daily_deliveries': daily_deliveries,
                'package_status_distribution': [
                    {'name': 'Delivered', 'value': package_stats.get('delivered_packages', 0) or 0},
                    {'name': 'In Transit', 'value': package_stats.get('in_transit_packages', 0) or 0},
                    {'name': 'Pending', 'value': package_stats.get('pending_packages', 0) or 0},
                    {'name': 'Undelivered', 'value': package_stats.get('undelivered_packages', 0) or 0}
                ],
                'summary_stats': {
                    'active_routes': active_routes,
                    'total_drivers': total_drivers,
                    'verified_drivers': verified_drivers,
                    'unverified_drivers': unverified_drivers
                },
                'recent_activity': recent_activity
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            return Response(
                {"error": f"Error retrieving statistics: {str(e)}", "details": error_details}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
