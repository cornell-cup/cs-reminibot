#include <stdio.h>
#include <unistd.h>

int main() {
	char a;
	scanf("%c", &a);
	if (a == 'w') {
		printf("Got w\n");
		fflush(stdout);
	}
	else
		printf("Did not get w\n");	
	sleep(100);	
  	// scanf("%c", &a);
  	return 0;
}